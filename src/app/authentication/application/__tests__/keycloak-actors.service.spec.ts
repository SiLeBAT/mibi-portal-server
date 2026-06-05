import { RegisterActorCommand } from '../../model/keycloak-actors.model';
import { UserAlreadyExistsError } from '../../domain/domain.error';
import { DefaultKeycloakActorsService } from '../keycloak-actors.service';

// jest.Mocked<T> doesn't recurse into nested objects, so we rely on inference
// tslint:disable-next-line: no-any
function mockAdminClient(): any {
    return {
        users: {
            create: jest.fn().mockResolvedValue({ id: 'sub-alice' }),
            update: jest.fn().mockResolvedValue(undefined),
            addToGroup: jest.fn().mockResolvedValue(undefined),
            executeActionsEmail: jest.fn().mockResolvedValue(undefined),
            find: jest.fn().mockResolvedValue([])
        },
        groups: {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn().mockResolvedValue({ id: 'new-grp-id' })
        },
        roles: {
            findUsersWithRole: jest.fn().mockResolvedValue([])
        }
    };
}

const REALM = 'mibi';

const CMD: RegisterActorCommand = {
    email: 'alice@lab.de',
    firstName: 'Alice',
    lastName: 'Mueller',
    instituteId: 'BfR',
    instituteName: 'BfR Federal Institute'
};

const BFR_GROUP = { id: 'grp-BfR', name: 'BfR', path: '/institutes/BfR' };

describe('DefaultKeycloakActorsService', () => {
    describe('registerPendingActor', () => {
        it('creates a disabled Keycloak user and returns a domain Actor', async () => {
            const client = mockAdminClient();
            client.users.create.mockResolvedValue({ id: 'sub-alice' });
            client.groups.find.mockResolvedValue([BFR_GROUP]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            const actor = await svc.registerPendingActor(CMD);

            expect(client.users.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    realm: REALM,
                    enabled: false,
                    email: 'alice@lab.de',
                    username: 'alice@lab.de',
                    firstName: 'Alice',
                    lastName: 'Mueller'
                })
            );
            expect(actor).toEqual({
                keycloakSub: 'sub-alice',
                instituteId: 'BfR',
                email: 'alice@lab.de',
                displayName: 'Alice Mueller'
            });
        });

        it('creates the institute group when it does not exist', async () => {
            const client = mockAdminClient();
            client.users.create.mockResolvedValue({ id: 'sub-alice' });
            client.groups.find.mockResolvedValue([]);
            client.groups.create.mockResolvedValue({ id: 'new-grp-id' });
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.registerPendingActor(CMD);

            expect(client.groups.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    realm: REALM,
                    name: 'BfR'
                })
            );
            expect(client.users.addToGroup).toHaveBeenCalledWith(
                expect.objectContaining({ groupId: 'new-grp-id' })
            );
        });

        it('reuses the existing institute group and skips group creation', async () => {
            const client = mockAdminClient();
            client.users.create.mockResolvedValue({ id: 'sub-alice' });
            client.groups.find.mockResolvedValue([BFR_GROUP]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.registerPendingActor(CMD);

            expect(client.groups.create).not.toHaveBeenCalled();
            expect(client.users.addToGroup).toHaveBeenCalledWith(
                expect.objectContaining({ groupId: 'grp-BfR' })
            );
        });

        it('sends executeActionsEmail to every mibi-admin member', async () => {
            const client = mockAdminClient();
            client.users.create.mockResolvedValue({ id: 'sub-alice' });
            client.groups.find.mockResolvedValue([BFR_GROUP]);
            client.roles.findUsersWithRole.mockResolvedValue([
                {
                    id: 'admin-1',
                    email: 'admin1@bfr.de',
                    firstName: 'Admin',
                    lastName: 'One'
                },
                {
                    id: 'admin-2',
                    email: 'admin2@bfr.de',
                    firstName: 'Admin',
                    lastName: 'Two'
                }
            ]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.registerPendingActor(CMD);

            expect(client.users.executeActionsEmail).toHaveBeenCalledTimes(2);
            expect(client.users.executeActionsEmail).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'admin-1', realm: REALM })
            );
            expect(client.users.executeActionsEmail).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'admin-2', realm: REALM })
            );
        });

        it('throws UserAlreadyExistsError when Keycloak returns 409', async () => {
            const client = mockAdminClient();
            const conflict = Object.assign(new Error('Conflict'), {
                response: { status: 409 }
            });
            client.users.create.mockRejectedValue(conflict);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await expect(svc.registerPendingActor(CMD)).rejects.toBeInstanceOf(
                UserAlreadyExistsError
            );
        });
    });

    describe('listMibiAdmins', () => {
        it('returns actors for all realm members with mibi-admin role', async () => {
            const client = mockAdminClient();
            client.roles.findUsersWithRole.mockResolvedValue([
                {
                    id: 'admin-sub',
                    email: 'admin@bfr.de',
                    firstName: 'Admin',
                    lastName: 'User'
                }
            ]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            const admins = await svc.listMibiAdmins();

            expect(client.roles.findUsersWithRole).toHaveBeenCalledWith({
                roleName: 'mibi-admin',
                realm: REALM
            });
            expect(admins).toHaveLength(1);
            expect(admins[0].keycloakSub).toBe('admin-sub');
            expect(admins[0].email).toBe('admin@bfr.de');
        });
    });

    describe('activateActor', () => {
        it('enables the user and sends VERIFY_EMAIL + UPDATE_PASSWORD email', async () => {
            const client = mockAdminClient();
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.activateActor('sub-alice');

            expect(client.users.update).toHaveBeenCalledWith(
                { id: 'sub-alice', realm: REALM },
                { enabled: true }
            );
            expect(client.users.executeActionsEmail).toHaveBeenCalledWith({
                id: 'sub-alice',
                realm: REALM,
                actions: ['VERIFY_EMAIL', 'UPDATE_PASSWORD']
            });
        });
    });

    describe('enableActor', () => {
        it('sets enabled=true on the Keycloak user', async () => {
            const client = mockAdminClient();
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.enableActor('sub-alice');

            expect(client.users.update).toHaveBeenCalledWith(
                { id: 'sub-alice', realm: REALM },
                { enabled: true }
            );
        });
    });

    describe('disableActor', () => {
        it('sets enabled=false on the Keycloak user', async () => {
            const client = mockAdminClient();
            const svc = new DefaultKeycloakActorsService(client, REALM);

            await svc.disableActor('sub-alice');

            expect(client.users.update).toHaveBeenCalledWith(
                { id: 'sub-alice', realm: REALM },
                { enabled: false }
            );
        });
    });

    describe('listPendingActorSummaries', () => {
        it('maps disabled users to PendingActorSummary with registeredAt from createdTimestamp', async () => {
            const createdTimestamp = new Date('2026-04-01T08:00:00Z').getTime();
            const client = mockAdminClient();
            client.users.find.mockResolvedValue([
                {
                    id: 'sub-alice',
                    email: 'alice@lab.de',
                    firstName: 'Alice',
                    lastName: 'Mueller',
                    createdTimestamp
                }
            ]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            const summaries = await svc.listPendingActorSummaries();

            expect(client.users.find).toHaveBeenCalledWith({
                realm: REALM,
                enabled: false
            });
            expect(summaries).toHaveLength(1);
            expect(summaries[0].keycloakSub).toBe('sub-alice');
            expect(summaries[0].registeredAt).toEqual(
                new Date(createdTimestamp)
            );
        });

        it('uses epoch when createdTimestamp is absent', async () => {
            const client = mockAdminClient();
            client.users.find.mockResolvedValue([
                { id: 'sub-x', email: 'x@lab.de' }
            ]);
            const svc = new DefaultKeycloakActorsService(client, REALM);

            const summaries = await svc.listPendingActorSummaries();

            expect(summaries[0].registeredAt).toEqual(new Date(0));
        });
    });
});
