import '../../middleware/session.augment';
import { Container } from 'inversify';
import { rebindMocks } from '../../../../__mocks__/util';
import { APPLICATION_TYPES } from '../../../../app/application.types';
import { getMockKeycloakActorsService } from '../../../../app/authentication/application/__mocks__/keycloak-actors.service';
import { mockKeycloakActorsModule } from '../../../../app/authentication/application/__mocks__/keycloak-actors.module';
import { mockKeycloakOidcModule } from '../../../../app/authentication/application/__mocks__/keycloak-oidc.module';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { KeycloakAdminController } from '../../model/controller.model';
import { getServerContainerModule } from '../../server.module';
import { SERVER_TYPES } from '../../server.types';

var mockReq = require('mock-express-request');
var mockRes = require('mock-express-response');

const SERVER_CONFIG = {
    port: 1,
    apiRoot: '',
    publicAPIDoc: {},
    jwtSecret: 'test',
    logLevel: 'info',
    supportContact: 'test',
    parseAPI: '',
    appId: '',
    clientUrl: 'http://localhost:4200',
    keycloak: {
        issuerUrl: 'https://keycloak.example.com/realms/mibi',
        clientId: 'mibi-portal-bff',
        clientSecret: 'secret',
        callbackUrl: 'http://localhost:3000/v2/auth/callback'
    }
};

const APP_CONFIG = {
    appName: 'test',
    jobRecipient: 'test',
    login: { threshold: 0, secondsDelay: 0 },
    clientUrl: 'http://localhost:4200',
    supportContact: 'test',
    jwtSecret: 'test'
};

const ADMIN_SESSION_USER = {
    sub: 'admin-1',
    email: 'admin@bfr.de',
    preferred_username: 'admin',
    groups: [],
    roles: ['mibi-admin'],
    id_token: 'tok'
};

const NON_ADMIN_SESSION_USER = {
    sub: 'user-1',
    email: 'user@lab.de',
    preferred_username: 'user',
    groups: ['/institutes/BfR'],
    roles: [],
    id_token: 'tok'
};

function buildController(container: Container): KeycloakAdminController {
    return container.get<KeycloakAdminController>(
        SERVER_TYPES.KeycloakAdminController
    );
}

describe('KeycloakAdminController', () => {
    let container: Container | null;

    beforeEach(() => {
        container = createContainer();
        container.load(
            getServerContainerModule(SERVER_CONFIG as any),
            getApplicationContainerModule(APP_CONFIG),
            mockPersistenceContainerModule,
            mockKeycloakOidcModule,
            mockKeycloakActorsModule
        );
    });

    afterEach(() => {
        container = null;
    });

    // ── GET /v2/admin/actors/pending ─────────────────────────────────────────

    describe('GET /v2/admin/actors/pending', () => {
        it('returns 403 for a non-admin session user', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: { user: NON_ADMIN_SESSION_USER }
            });
            const res = new mockRes();

            await controller.getPendingActors(req, res);

            expect(res.statusCode).toBe(403);
        });

        it('returns 403 when no session user', async () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {} });
            const res = new mockRes();

            await controller.getPendingActors(req, res);

            expect(res.statusCode).toBe(403);
        });

        it('returns 200 with the pending actors list for a mibi-admin', async () => {
            const mockActors = getMockKeycloakActorsService();
            mockActors.listPendingActors.mockResolvedValue([
                {
                    keycloakSub: 'pending-1',
                    email: 'pending@lab.de',
                    instituteId: 'BfR',
                    displayName: 'Pending User'
                }
            ]);
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({ session: { user: ADMIN_SESSION_USER } });
            const res = new mockRes();

            await controller.getPendingActors(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSON()).toEqual([
                {
                    keycloakSub: 'pending-1',
                    email: 'pending@lab.de',
                    instituteId: 'BfR',
                    displayName: 'Pending User'
                }
            ]);
        });

        it('returns 500 when listPendingActors throws', async () => {
            const mockActors = getMockKeycloakActorsService();
            mockActors.listPendingActors.mockRejectedValue(
                new Error('KC down')
            );
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({ session: { user: ADMIN_SESSION_USER } });
            const res = new mockRes();

            await controller.getPendingActors(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    // ── POST /v2/admin/actors/:sub/enable ────────────────────────────────────

    describe('POST /v2/admin/actors/:sub/enable', () => {
        it('returns 403 for a non-admin', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: { user: NON_ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postEnableActor(req, res);

            expect(res.statusCode).toBe(403);
        });

        it('calls activateActor and returns 200 for a mibi-admin', async () => {
            const mockActors = getMockKeycloakActorsService();
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({
                session: { user: ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postEnableActor(req, res);

            expect(mockActors.activateActor).toHaveBeenCalledWith('target-sub');
            expect(res.statusCode).toBe(200);
        });

        it('returns 500 when activateActor throws', async () => {
            const mockActors = getMockKeycloakActorsService();
            mockActors.activateActor.mockRejectedValue(new Error('KC error'));
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({
                session: { user: ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postEnableActor(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    // ── POST /v2/admin/actors/:sub/disable ───────────────────────────────────

    describe('POST /v2/admin/actors/:sub/disable', () => {
        it('returns 403 for a non-admin', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: { user: NON_ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postDisableActor(req, res);

            expect(res.statusCode).toBe(403);
        });

        it('calls disableActor and returns 200 for a mibi-admin', async () => {
            const mockActors = getMockKeycloakActorsService();
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({
                session: { user: ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postDisableActor(req, res);

            expect(mockActors.disableActor).toHaveBeenCalledWith('target-sub');
            expect(res.statusCode).toBe(200);
        });

        it('returns 500 when disableActor throws', async () => {
            const mockActors = getMockKeycloakActorsService();
            mockActors.disableActor.mockRejectedValue(new Error('KC error'));
            const controller = rebindMocks<KeycloakAdminController>(
                container,
                SERVER_TYPES.KeycloakAdminController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakActorsService,
                        instance: mockActors
                    }
                ]
            );
            const req = new mockReq({
                session: { user: ADMIN_SESSION_USER },
                params: { sub: 'target-sub' }
            });
            const res = new mockRes();

            await controller.postDisableActor(req, res);

            expect(res.statusCode).toBe(500);
        });
    });
});
