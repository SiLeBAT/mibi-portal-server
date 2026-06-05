import { Actor, ActorRepository } from '../../model/actor.model';
import { DefaultActorContextService } from '../actor-context.service';

function mockRepo(): jest.Mocked<ActorRepository> {
    return {
        findByKeycloakSub: jest.fn(),
        materialize: jest.fn()
    };
}

const ALICE: Actor = {
    keycloakSub: 'sub-alice',
    instituteId: 'BfR',
    email: 'alice@lab.de',
    displayName: 'alice'
};

describe('DefaultActorContextService', () => {
    describe('resolveActor', () => {
        it('returns cached actor without calling repository', async () => {
            const repo = mockRepo();
            const svc = new DefaultActorContextService(repo);

            const result = await svc.resolveActor(
                ALICE.keycloakSub,
                ALICE.email,
                ALICE.displayName,
                ['/institutes/BfR'],
                ALICE
            );

            expect(result).toBe(ALICE);
            expect(repo.findByKeycloakSub).not.toHaveBeenCalled();
            expect(repo.materialize).not.toHaveBeenCalled();
        });

        it('materializes and writes new _User actor when none exists', async () => {
            const repo = mockRepo();
            repo.findByKeycloakSub.mockResolvedValue(null);
            const created: Actor = {
                keycloakSub: 'sub-bob',
                instituteId: 'BfR',
                email: 'bob@lab.de',
                displayName: 'bob'
            };
            repo.materialize.mockResolvedValue(created);
            const svc = new DefaultActorContextService(repo);

            const result = await svc.resolveActor(
                'sub-bob',
                'bob@lab.de',
                'bob',
                ['/institutes/BfR']
            );

            expect(repo.materialize).toHaveBeenCalledWith({
                keycloakSub: 'sub-bob',
                instituteId: 'BfR',
                email: 'bob@lab.de',
                displayName: 'bob'
            });
            expect(result).toEqual(created);
        });

        it('throws when actor has no institute group', async () => {
            const svc = new DefaultActorContextService(mockRepo());

            await expect(
                svc.resolveActor('sub-x', 'x@lab.de', 'x', [])
            ).rejects.toThrow('exactly one institute group');
        });

        it('throws when actor belongs to more than one institute group', async () => {
            const svc = new DefaultActorContextService(mockRepo());

            await expect(
                svc.resolveActor('sub-x', 'x@lab.de', 'x', [
                    '/institutes/BfR',
                    '/institutes/LGL'
                ])
            ).rejects.toThrow('exactly one institute group');
        });

        it('two actors in the same institute group resolve independently by keycloakSub', async () => {
            const BOB: Actor = {
                keycloakSub: 'sub-bob',
                instituteId: 'BfR',
                email: 'bob@lab.de',
                displayName: 'bob'
            };
            const repo = mockRepo();
            repo.findByKeycloakSub.mockImplementation(keycloakSub =>
                Promise.resolve(keycloakSub === 'sub-alice' ? ALICE : BOB)
            );
            const svc = new DefaultActorContextService(repo);

            const [resultAlice, resultBob] = await Promise.all([
                svc.resolveActor(
                    ALICE.keycloakSub,
                    ALICE.email,
                    ALICE.displayName,
                    ['/institutes/BfR']
                ),
                svc.resolveActor(BOB.keycloakSub, BOB.email, BOB.displayName, [
                    '/institutes/BfR'
                ])
            ]);

            expect(resultAlice.keycloakSub).toBe('sub-alice');
            expect(resultAlice.instituteId).toBe('BfR');
            expect(resultBob.keycloakSub).toBe('sub-bob');
            expect(resultBob.instituteId).toBe('BfR');
            expect(repo.findByKeycloakSub).toHaveBeenCalledWith('sub-alice');
            expect(repo.findByKeycloakSub).toHaveBeenCalledWith('sub-bob');
            expect(repo.materialize).not.toHaveBeenCalled();
        });

        it('returns existing _User actor from repo without writing on cache miss', async () => {
            const repo = mockRepo();
            repo.findByKeycloakSub.mockResolvedValue(ALICE);
            const svc = new DefaultActorContextService(repo);

            const result = await svc.resolveActor(
                ALICE.keycloakSub,
                ALICE.email,
                ALICE.displayName,
                ['/institutes/BfR']
            );

            expect(result).toEqual(ALICE);
            expect(repo.findByKeycloakSub).toHaveBeenCalledWith(
                ALICE.keycloakSub
            );
            expect(repo.materialize).not.toHaveBeenCalled();
        });
    });
});
