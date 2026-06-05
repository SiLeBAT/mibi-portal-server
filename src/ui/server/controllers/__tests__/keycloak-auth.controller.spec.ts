import '../../middleware/session.augment';
import { rebindMocks } from '../../../../__mocks__/util';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { APPLICATION_TYPES } from '../../../../app/application.types';
import { getMockKeycloakOidcService } from '../../../../app/authentication/application/__mocks__/keycloak-oidc.service';
import { KeycloakAuthController } from '../../model/controller.model';
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

function buildController(container: TestContainer): KeycloakAuthController {
    return container.get<KeycloakAuthController>(
        SERVER_TYPES.KeycloakAuthController
    );
}

describe('KeycloakAuthController', () => {
    let container: TestContainer | null;

    beforeEach(() => {
        container = createTestContainer({
            serverConfig: SERVER_CONFIG as any,
            appConfig: APP_CONFIG
        });
    });

    afterEach(() => {
        container = null;
    });

    // ── /v2/me ──────────────────────────────────────────────────────────────

    describe('GET /v2/me', () => {
        it('returns 401 when no session user', () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {} });
            const res = new mockRes();

            controller.getMe(req, res);

            expect(res.statusCode).toBe(401);
        });

        it('returns 200 with sub, email, preferred_username when session user present', () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: {
                    user: {
                        sub: 'abc-123',
                        email: 'alice@example.com',
                        preferred_username: 'alice',
                        id_token: 'tok'
                    }
                }
            });
            const res = new mockRes();

            controller.getMe(req, res);

            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body).toEqual({
                sub: 'abc-123',
                email: 'alice@example.com',
                preferred_username: 'alice'
            });
            expect(body.id_token).toBeUndefined();
        });
    });

    // ── /v2/auth/login ───────────────────────────────────────────────────────

    describe('GET /v2/auth/login', () => {
        it('stores state and codeVerifier in session and redirects to authorizationUrl', async () => {
            const mockOidc = getMockKeycloakOidcService();
            const controller = rebindMocks<KeycloakAuthController>(
                container,
                SERVER_TYPES.KeycloakAuthController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakOidcService,
                        instance: mockOidc
                    }
                ]
            );
            const session: Record<string, unknown> = {};
            const req = new mockReq({ session });
            const res = new mockRes();
            res.redirect = jest.fn();

            await controller.getLogin(req, res);

            expect(session.oidcState).toBe('test-state');
            expect(session.codeVerifier).toBe('test-verifier');
            expect(res.redirect).toHaveBeenCalledWith(
                'https://keycloak.example.com/auth'
            );
        });

        it('returns 500 when OIDC service throws', async () => {
            const mockOidc = getMockKeycloakOidcService();
            mockOidc.buildAuthorizationUrl.mockRejectedValue(
                new Error('OIDC unavailable')
            );
            const controller = rebindMocks<KeycloakAuthController>(
                container,
                SERVER_TYPES.KeycloakAuthController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakOidcService,
                        instance: mockOidc
                    }
                ]
            );
            const req = new mockReq({ session: {} });
            const res = new mockRes();

            await controller.getLogin(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    // ── /v2/auth/callback ────────────────────────────────────────────────────

    describe('GET /v2/auth/callback', () => {
        it('exchanges code, stores user in session and redirects to clientUrl on success', async () => {
            const mockOidc = getMockKeycloakOidcService();
            const controller = rebindMocks<KeycloakAuthController>(
                container,
                SERVER_TYPES.KeycloakAuthController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakOidcService,
                        instance: mockOidc
                    }
                ]
            );
            const session: Record<string, unknown> = {
                oidcState: 'saved-state',
                codeVerifier: 'saved-verifier'
            };
            const req = new mockReq({
                session,
                query: { code: 'auth-code', state: 'saved-state' }
            });
            const res = new mockRes();
            res.redirect = jest.fn();

            await controller.getCallback(req, res);

            expect(mockOidc.exchangeCode).toHaveBeenCalledWith(
                'auth-code',
                'saved-state',
                'saved-verifier',
                undefined
            );
            expect((session as any).user).toMatchObject({
                sub: 'user-123',
                email: 'user@example.com'
            });
            expect(res.redirect).toHaveBeenCalledWith(SERVER_CONFIG.clientUrl);
        });

        it('returns 400 when state does not match session', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: { oidcState: 'expected-state' },
                query: { code: 'auth-code', state: 'wrong-state' }
            });
            const res = new mockRes();

            await controller.getCallback(req, res);

            expect(res.statusCode).toBe(400);
        });

        it('returns 500 when code exchange throws', async () => {
            const mockOidc = getMockKeycloakOidcService();
            mockOidc.exchangeCode.mockRejectedValue(
                new Error('exchange failed')
            );
            const controller = rebindMocks<KeycloakAuthController>(
                container,
                SERVER_TYPES.KeycloakAuthController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakOidcService,
                        instance: mockOidc
                    }
                ]
            );
            const req = new mockReq({
                session: { oidcState: 'st', codeVerifier: 'cv' },
                query: { code: 'c', state: 'st' }
            });
            const res = new mockRes();

            await controller.getCallback(req, res);

            expect(res.statusCode).toBe(500);
        });
    });

    // ── /v2/auth/logout ──────────────────────────────────────────────────────

    describe('POST /v2/auth/logout', () => {
        it('destroys session and returns endSessionUrl', async () => {
            const mockOidc = getMockKeycloakOidcService();
            const controller = rebindMocks<KeycloakAuthController>(
                container,
                SERVER_TYPES.KeycloakAuthController,
                [
                    {
                        id: APPLICATION_TYPES.KeycloakOidcService,
                        instance: mockOidc
                    }
                ]
            );
            const session = {
                user: {
                    sub: 'u1',
                    email: 'u@e.com',
                    preferred_username: 'u',
                    id_token: 'tok'
                },
                destroy: jest.fn((cb: (err?: Error) => void) => cb())
            };
            const req = new mockReq({ session });
            const res = new mockRes();

            await controller.postLogout(req, res);

            expect(session.destroy).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body.endSessionUrl).toBe(
                'https://keycloak.example.com/logout'
            );
        });
    });
});
