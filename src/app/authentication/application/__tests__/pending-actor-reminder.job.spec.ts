import { Actor } from '../../model/actor.model';
import { PendingActorSummary } from '../../model/keycloak-actors.model';
import {
    PendingActorReminderJob,
    PendingActorDigestPort,
    ReminderActorsPort,
    ReminderJobConfig
} from '../pending-actor-reminder.job';

const NOW = new Date('2026-05-13T10:00:00Z');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const CONFIG: ReminderJobConfig = {
    olderThanMs: SEVEN_DAYS_MS,
    windowMs: 3_600_000
};

const OLD_ENOUGH = new Date(NOW.getTime() - SEVEN_DAYS_MS - 1);
const TOO_RECENT = new Date(NOW.getTime() - SEVEN_DAYS_MS + 1);

function makeSummary(
    overrides: Partial<PendingActorSummary> = {}
): PendingActorSummary {
    return {
        sub: 'sub-1',
        email: 'alice@lab.de',
        displayName: 'Alice Mueller',
        instituteId: 'BfR',
        registeredAt: OLD_ENOUGH,
        ...overrides
    };
}

function makeAdmin(overrides: Partial<Actor> = {}): Actor {
    return {
        sub: 'admin-1',
        email: 'admin@bfr.de',
        displayName: 'Admin One',
        instituteId: '',
        ...overrides
    };
}

function makeActors(
    pending: PendingActorSummary[],
    admins: Actor[]
): ReminderActorsPort {
    return {
        listPendingActorSummaries: jest.fn().mockResolvedValue(pending),
        listMibiAdmins: jest.fn().mockResolvedValue(admins)
    };
}

function makeDigest(): jest.Mocked<PendingActorDigestPort> {
    return { send: jest.fn().mockResolvedValue(undefined) };
}

function makeJob(
    actors: ReminderActorsPort,
    digest: PendingActorDigestPort,
    config: ReminderJobConfig = CONFIG
): PendingActorReminderJob {
    return new PendingActorReminderJob(actors, digest, config, () => NOW);
}

describe('PendingActorReminderJob', () => {
    describe('run', () => {
        it('sends digest to admins when pending actors are older than the threshold', async () => {
            const pending = [makeSummary()];
            const admins = [makeAdmin()];
            const actors = makeActors(pending, admins);
            const digest = makeDigest();

            await makeJob(actors, digest).run();

            expect(digest.send).toHaveBeenCalledTimes(1);
            expect(digest.send).toHaveBeenCalledWith(admins, pending);
        });

        it('sends no email when the pending list is empty', async () => {
            const actors = makeActors([], [makeAdmin()]);
            const digest = makeDigest();

            await makeJob(actors, digest).run();

            expect(digest.send).not.toHaveBeenCalled();
        });

        it('sends no email when all pending actors are within the threshold', async () => {
            const actors = makeActors(
                [makeSummary({ registeredAt: TOO_RECENT })],
                [makeAdmin()]
            );
            const digest = makeDigest();

            await makeJob(actors, digest).run();

            expect(digest.send).not.toHaveBeenCalled();
        });

        it('skips sending when called again within the same window', async () => {
            const actors = makeActors([makeSummary()], [makeAdmin()]);
            const digest = makeDigest();
            const job = makeJob(actors, digest);

            await job.run();
            await job.run();

            expect(digest.send).toHaveBeenCalledTimes(1);
        });

        it('filters out actors within the threshold and only includes those past it', async () => {
            const oldActor = makeSummary({
                sub: 'old',
                registeredAt: OLD_ENOUGH
            });
            const newActor = makeSummary({
                sub: 'new',
                registeredAt: TOO_RECENT
            });
            const actors = makeActors([oldActor, newActor], [makeAdmin()]);
            const digest = makeDigest();

            await makeJob(actors, digest).run();

            expect(digest.send).toHaveBeenCalledWith(expect.anything(), [
                oldActor
            ]);
        });
    });
});
