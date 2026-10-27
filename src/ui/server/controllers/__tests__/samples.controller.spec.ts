import '../../middleware/session.augment';
import axios from 'axios';
import {
    bearer,
    expiredTestToken,
    signTestToken,
    unsignedTestToken
} from '../../../../__mocks__/jwt';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { rebindMocks } from '../../../../__mocks__/util';
import { APPLICATION_TYPES } from '../../../../app/application.types';
import {
    genericUser,
    getMockUserService
} from '../../../../app/authentication/application/__mocks__/user.service';
import { UserService } from '../../../../app/authentication/model/user.model';
import { SamplesController } from '../../model/controller.model';
import { SERVER_ERROR_CODE } from '../../model/enums';
import { SERVER_TYPES } from '../../server.types';

var mockReq = require('mock-express-request');
var mockRes = require('mock-express-response');

jest.mock('axios');

const SERVER_CONFIG = {
    port: 1,
    apiRoot: '',
    publicAPIDoc: {},
    jwtSecret: 'test',
    logLevel: 'info',
    supportContact: 'test',
    parseAPI: 'http://parse',
    appId: 'test-app'
};

const APP_CONFIG = {
    appName: 'test',
    jobRecipient: 'test',
    login: { threshold: 0, secondsDelay: 0 },
    clientUrl: 'test',
    supportContact: 'test',
    jwtSecret: 'test'
};

function buildController(container: TestContainer): SamplesController {
    return container.get<SamplesController>(SERVER_TYPES.SamplesController);
}

describe('DefaultSamplesController', () => {
    let container: TestContainer | null;
    let mockAxiosPost: jest.Mock;

    beforeEach(() => {
        mockAxiosPost = jest.fn().mockResolvedValue({ data: { result: {} } });
        (axios.create as unknown as jest.Mock).mockReturnValue({
            post: mockAxiosPost
        });

        container = createTestContainer({
            serverConfig: SERVER_CONFIG as any,
            appConfig: APP_CONFIG
        });
    });

    afterEach(() => {
        container = null;
    });

    // ── POST /v2/samples/submitted ───────────────────────────────────────────

    // ── PUT /v2/samples/validated ────────────────────────────────────────────

    describe('PUT /v2/samples/validated', () => {
        it('sends actor email when actor present', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: {},
                body: {},
                currentActor: {
                    keycloakSub: 'u2',
                    email: 'validator@example.com',
                    instituteId: 'inst2',
                    displayName: 'Validator'
                }
            });
            const res = new mockRes();

            await controller.putValidated(req, res);

            expect(mockAxiosPost).toHaveBeenCalledWith(
                'functions/validateSampleData',
                expect.objectContaining({ userEmail: 'validator@example.com' })
            );
        });

        it('sends null userEmail when no session actor (public access preserved)', async () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: {} });
            const res = new mockRes();

            await controller.putValidated(req, res);

            expect(mockAxiosPost).toHaveBeenCalledWith(
                'functions/validateSampleData',
                expect.objectContaining({ userEmail: null })
            );
        });
    });

    // ── POST /v2/samples/submitted ───────────────────────────────────────────

    describe('POST /v2/samples/submitted', () => {
        it('returns 401 when no session actor', async () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: {} });
            const res = new mockRes();

            await controller.postSubmitted(req, res);

            expect(res.statusCode).toBe(401);
        });

        it('sends actor email to Parse and returns 200 when actor present', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                session: {},
                body: { samples: [] },
                currentActor: {
                    keycloakSub: 'u1',
                    email: 'user@example.com',
                    instituteId: 'inst1',
                    displayName: 'User One'
                }
            });
            const res = new mockRes();

            await controller.postSubmitted(req, res);

            expect(mockAxiosPost).toHaveBeenCalledWith(
                'functions/submitSampleData',
                expect.objectContaining({ userEmail: 'user@example.com' })
            );
            expect(res.statusCode).toBe(200);
        });

        // The cloud function reports a refused order by returning an error
        // DTO, which Parse delivers with a 200. Relaying that as a 200 would
        // make a rejected submission look successful to an API user.
        describe('when the cloud function refused the order', () => {
            const errorDTO = {
                code: 13,
                message:
                    'Different analysis procedures were requested for samples of the same NRL.',
                order: { sampleSet: { samples: [], meta: {} } },
                findings: [{ issue: 'DIFFERENT_ANALYSIS_FOR_SAME_NRL' }]
            };

            function submittingRequest() {
                return new mockReq({
                    session: {},
                    body: { samples: [] },
                    currentActor: {
                        keycloakSub: 'u1',
                        email: 'user@example.com',
                        instituteId: 'inst1',
                        displayName: 'User One'
                    }
                });
            }

            beforeEach(() => {
                mockAxiosPost.mockResolvedValue({
                    data: { result: errorDTO }
                });
            });

            it('answers 422 instead of passing the 200 through', async () => {
                const controller = buildController(container!);
                const res = new mockRes();

                await controller.postSubmitted(submittingRequest(), res);

                expect(res.statusCode).toBe(422);
            });

            it('keeps the error details so the sender learns what is wrong', async () => {
                const controller = buildController(container!);
                const res = new mockRes();

                await controller.postSubmitted(submittingRequest(), res);

                const body = res._getJSON();
                expect(body.code).toBe(errorDTO.code);
                expect(body.message).toBe(errorDTO.message);
                expect(body.findings).toEqual(errorDTO.findings);
            });
        });
    });

    // ── Authorization via legacy JWT ─────────────────────────────────────────

    // /samples and /samples/validated are on the JWT middleware whitelist and
    // /samples/submitted accepts a Keycloak actor instead of a JWT, so the
    // controller decides who the request acts for.
    describe('authorization with a legacy JWT', () => {
        const ACTOR = {
            keycloakSub: 'u1',
            email: 'actor@lab.de',
            instituteId: 'inst1',
            displayName: 'Actor'
        };
        const TOKEN_USER = {
            ...genericUser,
            uniqueId: 'user-1',
            email: 'token-user@lab.de'
        };

        let controller: SamplesController;
        let userService: UserService;

        beforeEach(() => {
            userService = getMockUserService();
            (userService.getUserById as jest.Mock).mockImplementation(
                (id: string) =>
                    id === TOKEN_USER.uniqueId
                        ? Promise.resolve(TOKEN_USER)
                        : Promise.reject(new Error(`No user with id ${id}`))
            );
            controller = rebindMocks<SamplesController>(
                container,
                SERVER_TYPES.SamplesController,
                [{ id: APPLICATION_TYPES.UserService, instance: userService }]
            );
        });

        function request(opts: {
            token?: string;
            actor?: typeof ACTOR;
            body?: object;
        }) {
            return new mockReq({
                session: {},
                headers: opts.token
                    ? { authorization: bearer(opts.token) }
                    : {},
                body: opts.body ?? { samples: [] },
                currentActor: opts.actor
            });
        }

        function sentUserEmail() {
            return mockAxiosPost.mock.calls[0][1].userEmail;
        }

        describe('POST /v2/samples/submitted', () => {
            it('submits for the user of a valid token', async () => {
                const res = new mockRes();

                await controller.postSubmitted(
                    request({ token: signTestToken('user-1') }),
                    res
                );

                expect(userService.getUserById).toHaveBeenCalledWith('user-1');
                expect(sentUserEmail()).toBe('token-user@lab.de');
                expect(res.statusCode).toBe(200);
            });

            it('prefers the Keycloak actor over a token', async () => {
                const res = new mockRes();

                await controller.postSubmitted(
                    request({ token: signTestToken('user-1'), actor: ACTOR }),
                    res
                );

                expect(userService.getUserById).not.toHaveBeenCalled();
                expect(sentUserEmail()).toBe('actor@lab.de');
            });

            it('answers 401 without an actor or token', async () => {
                const res = new mockRes();

                await controller.postSubmitted(request({}), res);

                expect(res.statusCode).toBe(401);
                expect(res._getJSON()).toEqual({
                    message: 'Not authenticated'
                });
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });

            it('does not let the request body choose the user email', async () => {
                const res = new mockRes();

                await controller.postSubmitted(
                    request({
                        token: signTestToken('user-1'),
                        body: { samples: [], userEmail: 'victim@lab.de' }
                    }),
                    res
                );

                expect(sentUserEmail()).toBe('token-user@lab.de');
            });

            it('does not accept a user email from the body without a token', async () => {
                const res = new mockRes();

                await controller.postSubmitted(
                    request({
                        body: { samples: [], userEmail: 'victim@lab.de' }
                    }),
                    res
                );

                expect(res.statusCode).toBe(401);
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });

            // Invalid tokens reach the generic error handler and answer 500,
            // not 401. What matters for security is that nothing is submitted.
            it.each([
                ['an expired token', expiredTestToken('user-1')],
                ['an unsigned (alg=none) token', unsignedTestToken('user-1')],
                [
                    'a token signed with another secret',
                    signTestToken('user-1', {}, 'other-secret')
                ],
                ['a token of an unknown user', signTestToken('ghost')]
            ])('does not submit with %s', async (_case, token) => {
                const res = new mockRes();

                await controller.postSubmitted(request({ token }), res);

                expect(res.statusCode).toBe(500);
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });
        });

        describe('PUT /v2/samples/validated', () => {
            it('validates for the user of a valid token', async () => {
                const res = new mockRes();

                await controller.putValidated(
                    request({ token: signTestToken('user-1') }),
                    res
                );

                expect(sentUserEmail()).toBe('token-user@lab.de');
                expect(res.statusCode).toBe(200);
            });

            it('prefers the Keycloak actor over a token', async () => {
                const res = new mockRes();

                await controller.putValidated(
                    request({ token: signTestToken('user-1'), actor: ACTOR }),
                    res
                );

                expect(sentUserEmail()).toBe('actor@lab.de');
            });

            it('does not let an anonymous request body choose the user email', async () => {
                const res = new mockRes();

                await controller.putValidated(
                    request({ body: { userEmail: 'victim@lab.de' } }),
                    res
                );

                expect(sentUserEmail()).toBeNull();
            });

            it.each([
                ['an expired token', expiredTestToken('user-1')],
                ['an unsigned (alg=none) token', unsignedTestToken('user-1')]
            ])(
                'does not fall back to anonymous validation with %s',
                async (_case, token) => {
                    const res = new mockRes();

                    await controller.putValidated(request({ token }), res);

                    expect(res.statusCode).toBe(500);
                    expect(mockAxiosPost).not.toHaveBeenCalled();
                }
            );
        });
    });

    // ── PUT /v2/samples ──────────────────────────────────────────────────────

    describe('PUT /v2/samples', () => {
        it('answers 400 for a raw excel upload', async () => {
            const controller = buildController(container!);
            const req = new mockReq({
                headers: {
                    'content-type':
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                },
                body: {}
            });
            const res = new mockRes();

            await controller.putSamples(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSON().code).toBe(SERVER_ERROR_CODE.INPUT_ERROR);
            expect(mockAxiosPost).not.toHaveBeenCalled();
        });

        it('answers 422 when the cloud function returns an error DTO', async () => {
            mockAxiosPost.mockResolvedValue({
                data: { result: { code: 5, message: 'invalid' } }
            });
            const controller = buildController(container!);
            const req = new mockReq({
                headers: { 'content-type': 'application/json' },
                body: {
                    order: { sampleSet: { meta: { fileName: 'f.xlsx' } } }
                }
            });
            const res = new mockRes();

            await controller.putSamples(req, res);

            expect(res.statusCode).toBe(422);
        });
    });
});
