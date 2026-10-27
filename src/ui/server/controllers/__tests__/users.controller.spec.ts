import '../../middleware/session.augment';
import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    bearer,
    expiredTestToken,
    signTestToken,
    tamperedTestToken,
    TEST_JWT_SECRET,
    unsignedTestToken
} from '../../../../__mocks__/jwt';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { DefaultTokenService } from '../../../../app/authentication/application/token.service';
import {
    genericUser,
    getMockUserService
} from '../../../../app/authentication/application/__mocks__/user.service';
import { AuthorizationError } from '../../../../app/authentication/domain/domain.error';
import { UserConsentPort } from '../../../../app/authentication/model/consent.model';
import { UserEmailNotificationPort } from '../../../../app/authentication/model/email-notification.model';
import {
    LoginPort,
    PasswordPort
} from '../../../../app/authentication/model/login.model';
import { RegistrationPort } from '../../../../app/authentication/model/registration.model';
import { UserService } from '../../../../app/authentication/model/user.model';
import { ConfigurationService } from '../../../../app/core/model/configuration.model';
import { getMockTokenRepository } from '../../../../infrastructure/persistence/__mocks__/token.repository';
import { UsersController } from '../../model/controller.model';
import { SERVER_ERROR_CODE } from '../../model/enums';
import { SERVER_TYPES } from '../../server.types';
import { DefaultUsersController } from '../users.controller';

var mockReq = require('mock-express-request');
var mockRes = require('mock-express-response');

jest.mock('parse/node', () => ({
    User: { signUp: jest.fn().mockResolvedValue({}) }
}));

describe('UsersController', () => {
    let container: TestContainer | null;

    beforeEach(() => {
        container = createTestContainer({
            serverConfig: {
                port: 1,
                apiRoot: '',
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test',
                parseAPI: '',
                appId: ''
            },
            appConfig: {
                appName: 'test',
                jobRecipient: 'test',
                login: { threshold: 0, secondsDelay: 0 },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }
        });
    });

    afterEach(() => {
        container = null;
    });

    it('resolves from container', () => {
        const controller = container!.get<UsersController>(
            SERVER_TYPES.UsersController
        );
        expect(controller).toBeDefined();
    });
});

describe('DefaultUsersController', () => {
    const TOKEN_USER = {
        ...genericUser,
        uniqueId: 'user-1',
        email: 'token-user@lab.de'
    };
    const SESSION_USER = {
        sub: 'kc-1',
        email: 'session-user@lab.de',
        preferred_username: 'session-user',
        groups: [],
        roles: [],
        id_token: 'tok'
    };
    const NOTIFICATION_SETTINGS = {
        enabled: true,
        frequency: 'weekly',
        weekday: 'friday',
        weekOfMonth: '1'
    };

    let controller: DefaultUsersController;
    let loginService: jest.Mocked<LoginPort>;
    let passwordService: jest.Mocked<PasswordPort>;
    let userService: UserService;
    let consentService: jest.Mocked<UserConsentPort>;
    let notificationService: jest.Mocked<UserEmailNotificationPort>;

    beforeEach(() => {
        const configurationService = {
            getApplicationConfiguration: () => ({ jwtSecret: TEST_JWT_SECRET })
        } as unknown as ConfigurationService;
        loginService = { loginUser: jest.fn() };
        passwordService = {
            requestPasswordReset: jest.fn().mockResolvedValue(undefined),
            resetPassword: jest.fn().mockResolvedValue(undefined)
        };
        userService = getMockUserService();
        (userService.getUserById as jest.Mock).mockImplementation(
            (id: string) =>
                id === TOKEN_USER.uniqueId
                    ? Promise.resolve(TOKEN_USER)
                    : Promise.reject(new Error(`No user with id ${id}`))
        );
        consentService = {
            getConsentByEmail: jest.fn().mockResolvedValue({
                dataSaveAgreed: false,
                dataSaveViewed: false
            }),
            saveConsentByEmail: jest.fn().mockResolvedValue({
                dataSaveAgreed: true,
                dataSaveViewed: true
            })
        };
        notificationService = {
            getEmailNotificationSettingsByEmail: jest
                .fn()
                .mockResolvedValue(NOTIFICATION_SETTINGS),
            saveEmailNotificationSettingsByEmail: jest
                .fn()
                .mockResolvedValue(NOTIFICATION_SETTINGS)
        };

        controller = new DefaultUsersController(
            passwordService,
            loginService,
            {} as RegistrationPort,
            new DefaultTokenService(
                configurationService,
                getMockTokenRepository()
            ),
            userService,
            consentService,
            notificationService,
            { parseAPI: '', appId: '' } as any
        );
    });

    function request(opts: {
        token?: string;
        sessionUser?: typeof SESSION_USER;
        body?: object;
    }) {
        return new mockReq({
            session: opts.sessionUser ? { user: opts.sessionUser } : {},
            headers: opts.token ? { authorization: bearer(opts.token) } : {},
            body: opts.body ?? {}
        });
    }

    // ── PATCH /v2/users/consent and /v2/users/email-notifications ────────────

    type SettingsEndpoint = {
        name: string;
        validBody: object;
        call: (req: Request, res: Response) => Promise<void>;
        save: () => jest.Mock;
    };

    const SETTINGS_ENDPOINTS: SettingsEndpoint[] = [
        {
            name: 'patchConsent',
            validBody: { dataSaveAgreed: true },
            call: (req, res) => controller.patchConsent(req, res),
            save: () => consentService.saveConsentByEmail as jest.Mock
        },
        {
            name: 'patchEmailNotificationSettings',
            validBody: NOTIFICATION_SETTINGS,
            call: (req, res) =>
                controller.patchEmailNotificationSettings(req, res),
            save: () =>
                notificationService.saveEmailNotificationSettingsByEmail as jest.Mock
        }
    ];

    describe.each(SETTINGS_ENDPOINTS)('$name', endpoint => {
        async function patch(opts: Parameters<typeof request>[0]) {
            const res = new mockRes();
            await endpoint.call(
                request({ body: endpoint.validBody, ...opts }),
                res
            );
            return res;
        }

        it('saves for the Keycloak session user', async () => {
            const res = await patch({ sessionUser: SESSION_USER });

            expect(res.statusCode).toBe(200);
            expect(endpoint.save()).toHaveBeenCalledWith(
                'session-user@lab.de',
                expect.anything()
            );
        });

        it('saves for the user of a valid token', async () => {
            const res = await patch({ token: signTestToken('user-1') });

            expect(res.statusCode).toBe(200);
            expect(userService.getUserById).toHaveBeenCalledWith('user-1');
            expect(endpoint.save()).toHaveBeenCalledWith(
                'token-user@lab.de',
                expect.anything()
            );
        });

        it('prefers the Keycloak session user over a token', async () => {
            await patch({
                sessionUser: SESSION_USER,
                token: signTestToken('user-1')
            });

            expect(userService.getUserById).not.toHaveBeenCalled();
            expect(endpoint.save()).toHaveBeenCalledWith(
                'session-user@lab.de',
                expect.anything()
            );
        });

        it('answers 401 without a session user or token', async () => {
            const res = await patch({});

            expect(res.statusCode).toBe(401);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Not authenticated'
            });
            expect(endpoint.save()).not.toHaveBeenCalled();
        });

        it('does not take the user email from the request body', async () => {
            const res = await patch({
                body: { ...endpoint.validBody, email: 'victim@lab.de' }
            });

            expect(res.statusCode).toBe(401);
            expect(endpoint.save()).not.toHaveBeenCalled();
        });

        it.each([
            ['a token that is not a JWT', 'not-a-jwt'],
            [
                'a token signed with another secret',
                signTestToken('user-1', {}, 'other-secret')
            ],
            ['an expired token', expiredTestToken('user-1')],
            ['an unsigned (alg=none) token', unsignedTestToken('user-1')],
            ['a token with a tampered payload', tamperedTestToken('user-1')]
        ])('answers 401 for %s', async (_case, token) => {
            const res = await patch({ token });

            expect(res.statusCode).toBe(401);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Unauthorized request'
            });
            expect(endpoint.save()).not.toHaveBeenCalled();
        });

        it('answers 500 for a valid token of a user that does not exist', async () => {
            const res = await patch({ token: signTestToken('ghost') });

            expect(res.statusCode).toBe(500);
            expect(endpoint.save()).not.toHaveBeenCalled();
        });

        it('answers 400 for an authenticated request with an invalid body', async () => {
            const res = await patch({
                sessionUser: SESSION_USER,
                body: { nonsense: true }
            });

            expect(res.statusCode).toBe(400);
            expect(res._getJSON().code).toBe(SERVER_ERROR_CODE.INPUT_ERROR);
            expect(endpoint.save()).not.toHaveBeenCalled();
        });

        it('checks authentication before the body', async () => {
            const res = await patch({ body: { nonsense: true } });

            expect(res.statusCode).toBe(401);
        });
    });

    // ── POST /v2/users/login ─────────────────────────────────────────────────

    describe('postLogin', () => {
        function loginRequest() {
            return new mockReq({
                headers: { host: 'localhost', 'user-agent': 'jest' },
                body: { email: 'token-user@lab.de', password: 'secret' }
            });
        }

        it('answers 200 with a token for valid credentials', async () => {
            loginService.loginUser.mockResolvedValue({
                user: TOKEN_USER,
                token: 'new-token'
            } as any);
            const res = new mockRes();

            await controller.postLogin(loginRequest(), res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSON()).toEqual(
                expect.objectContaining({
                    email: 'token-user@lab.de',
                    token: 'new-token'
                })
            );
        });

        it('answers 401 for wrong credentials', async () => {
            loginService.loginUser.mockRejectedValue(
                new AuthorizationError('wrong password')
            );
            const res = new mockRes();

            await controller.postLogin(loginRequest(), res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                message: 'Authentication failure'
            });
        });

        it('answers 401 with the wait time after too many failed attempts', async () => {
            const error = new AuthorizationError('locked');
            error.timeToWait = 300;
            loginService.loginUser.mockRejectedValue(error);
            const res = new mockRes();

            await controller.postLogin(loginRequest(), res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                message: 'Too many failed login attempts',
                waitTime: 300
            });
        });

        it('answers 500 and sends no token when the login fails unexpectedly', async () => {
            loginService.loginUser.mockRejectedValue(new Error('db down'));
            const res = new mockRes();

            await controller.postLogin(loginRequest(), res);

            expect(res.statusCode).toBe(500);
            expect(res._getJSON().token).toBeUndefined();
        });
    });

    // ── Password reset ───────────────────────────────────────────────────────

    describe('putResetPasswordRequest', () => {
        it('answers 400 without an email', async () => {
            const res = new mockRes();

            await controller.putResetPasswordRequest(
                new mockReq({ body: {} }),
                res
            );

            expect(res.statusCode).toBe(400);
            expect(passwordService.requestPasswordReset).not.toHaveBeenCalled();
        });
    });

    describe('patchResetPassword', () => {
        it('answers 400 without a new password', async () => {
            const res = new mockRes();

            await controller.patchResetPassword(
                'reset-token',
                new mockReq({ body: {} }),
                res
            );

            expect(res.statusCode).toBe(400);
            expect(passwordService.resetPassword).not.toHaveBeenCalled();
        });

        // The password service throws JsonWebTokenError for a reset token that
        // is invalid, expired or of the wrong type (e.g. an activation token).
        it('answers 401 when the reset token is rejected', async () => {
            passwordService.resetPassword.mockRejectedValue(
                new JsonWebTokenError('Token type does not match the action')
            );
            const res = new mockRes();

            await controller.patchResetPassword(
                'activation-token',
                new mockReq({ body: { password: 'new-secret' } }),
                res
            );

            expect(res.statusCode).toBe(401);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Unauthorized request'
            });
        });
    });
});
