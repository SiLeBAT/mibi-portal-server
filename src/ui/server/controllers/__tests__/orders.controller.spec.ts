import '../../middleware/session.augment';
import axios from 'axios';
import {
    bearer,
    expiredTestToken,
    signTestToken,
    tamperedTestToken,
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
import { OrdersController } from '../../model/controller.model';
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
    resultsApiKey: 'test-results-key',
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

const RESULTS_PAYLOAD = [
    { snPlXS7wIY: { Citrat: 'kW', 'O-AG': '166' } },
    { y4NvFfFNdg: { Serovar: 'S. Typhimurium' } },
    { y4NvFfFNdg: { Serovar: 'S. Brandenburg' } }
];

function buildController(container: TestContainer): OrdersController {
    return container.get<OrdersController>(SERVER_TYPES.OrdersController);
}

describe('DefaultOrdersController', () => {
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

    describe('POST /v2/orders/results', () => {
        it('forwards the array to the cloud function wrapped in an object', async () => {
            // Parse.Cloud parameters are always an object, so the array cannot
            // be the top-level value of the redirected request.
            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: RESULTS_PAYLOAD });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(mockAxiosPost).toHaveBeenCalledWith(
                'functions/storeResults',
                { results: RESULTS_PAYLOAD }
            );
        });

        it('preserves two results carrying the same sample id', async () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: RESULTS_PAYLOAD });
            const res = new mockRes();

            await controller.postResults(req, res);

            const forwarded = mockAxiosPost.mock.calls[0][1].results;
            expect(forwarded).toHaveLength(3);
            expect(
                forwarded.filter(
                    (entry: Record<string, unknown>) =>
                        Object.keys(entry)[0] === 'y4NvFfFNdg'
                )
            ).toHaveLength(2);
        });

        it('forwards numbers and null untouched', async () => {
            // The LIMS sends values as JSON as they are. Validating them is the
            // cloud function's job, so the portal server must not coerce or
            // drop anything on the way through.
            const controller = buildController(container!);
            const req = new mockReq({
                session: {},
                body: [
                    {
                        lYdFT3kHx8: {
                            Gattung: 'Yersinia',
                            Biotyp: 4,
                            'MHK CHL': null
                        }
                    }
                ]
            });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(mockAxiosPost.mock.calls[0][1].results[0]).toEqual({
                lYdFT3kHx8: {
                    Gattung: 'Yersinia',
                    Biotyp: 4,
                    'MHK CHL': null
                }
            });
        });

        it('answers 200 with the cloud function result', async () => {
            const storeResult = {
                storedResultCount: 3,
                orders: [{ orderId: 'D9iQERFiCb', results: '2/12' }],
                created: [
                    {
                        objectId: 'Rst1',
                        sampleObjectId: 'snPlXS7wIY',
                        position: 1
                    }
                ]
            };
            mockAxiosPost.mockResolvedValue({ data: { result: storeResult } });

            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: RESULTS_PAYLOAD });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSON()).toEqual(storeResult);
        });

        it('answers 422 when the cloud function returns an error DTO', async () => {
            // Parse hands a refused import back inside a 200; relaying that as
            // a 200 would make it look successful.
            mockAxiosPost.mockResolvedValue({
                data: {
                    result: {
                        code: 11,
                        message: 'Unknown sample objectIds: xxxYYY'
                    }
                }
            });

            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: RESULTS_PAYLOAD });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(res.statusCode).toBe(422);
            expect(res._getJSON()).toEqual(
                expect.objectContaining({
                    message: expect.stringContaining('Unknown sample objectIds')
                })
            );
        });

        it('answers 400 for a body that is not an array, without calling parse', async () => {
            // The object form is the mistake this payload invites, and it
            // silently loses one of two results for the same sample.
            const controller = buildController(container!);
            const req = new mockReq({
                session: {},
                body: { y4NvFfFNdg: { Serovar: 'S. Brandenburg' } }
            });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(res.statusCode).toBe(400);
            expect(mockAxiosPost).not.toHaveBeenCalled();
        });

        it('answers 400 for an empty array, without calling parse', async () => {
            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: [] });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(res.statusCode).toBe(400);
            expect(mockAxiosPost).not.toHaveBeenCalled();
        });

        it('answers 500 when the cloud function call fails', async () => {
            mockAxiosPost.mockRejectedValue(new Error('parse is down'));

            const controller = buildController(container!);
            const req = new mockReq({ session: {}, body: RESULTS_PAYLOAD });
            const res = new mockRes();

            await controller.postResults(req, res);

            expect(res.statusCode).toBe(500);
        });
    });
});

const USER = { ...genericUser, uniqueId: 'user-1', email: 'owner@lab.de' };

type Endpoint = 'getOrders' | 'getSamplesWithResults' | 'deleteOrders';

// The /orders routes are on the JWT middleware whitelist, so the controller
// is the only place that authenticates these requests.
const ENDPOINTS: [Endpoint, string][] = [
    ['getOrders', 'functions/createOrderList'],
    ['getSamplesWithResults', 'functions/getSamplesWithResults'],
    ['deleteOrders', 'functions/deleteOrdersByUser']
];

describe('DefaultOrdersController authorization', () => {
    let container: TestContainer | null;
    let controller: OrdersController;
    let userService: UserService;
    let mockAxiosPost: jest.Mock;

    beforeEach(() => {
        mockAxiosPost = jest
            .fn()
            .mockResolvedValue({ data: { result: { parse: 'result' } } });
        (axios.create as unknown as jest.Mock).mockReturnValue({
            post: mockAxiosPost
        });

        container = createTestContainer({
            serverConfig: SERVER_CONFIG as any,
            appConfig: APP_CONFIG
        });
        userService = getMockUserService();
        (userService.getUserById as jest.Mock).mockImplementation(
            (id: string) =>
                id === USER.uniqueId
                    ? Promise.resolve(USER)
                    : Promise.reject(new Error(`No user with id ${id}`))
        );
        controller = rebindMocks<OrdersController>(
            container,
            SERVER_TYPES.OrdersController,
            [{ id: APPLICATION_TYPES.UserService, instance: userService }]
        );
    });

    afterEach(() => {
        container = null;
    });

    async function call(
        endpoint: Endpoint,
        authorization?: string,
        body: object = {}
    ) {
        const req = new mockReq({
            session: {},
            headers: authorization ? { authorization } : {},
            body
        });
        const res = new mockRes();
        await controller[endpoint](req, res);
        return res;
    }

    describe.each(ENDPOINTS)('%s', (endpoint, cloudFunction) => {
        describe('without a token', () => {
            it.each([
                ['no Authorization header', undefined],
                ['a non-Bearer scheme', `Basic ${signTestToken('user-1')}`],
                ['a Bearer scheme without a token', 'Bearer']
            ])(
                'answers 401 and does not call Parse for %s',
                async (_case, authorization) => {
                    const res = await call(endpoint, authorization);

                    expect(res.statusCode).toBe(401);
                    expect(res._getJSON()).toEqual({
                        code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                        message: 'Not authenticated'
                    });
                    expect(mockAxiosPost).not.toHaveBeenCalled();
                }
            );

            it('does not accept a user email from the request body instead', async () => {
                const res = await call(endpoint, undefined, {
                    userEmail: 'owner@lab.de'
                });

                expect(res.statusCode).toBe(401);
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });
        });

        describe('with an invalid token', () => {
            // These reach the generic error handler and answer 500, not 401.
            // What matters for security is that nothing reaches Parse.
            it.each([
                ['a token that is not a JWT', 'not-a-jwt'],
                [
                    'a token signed with another secret',
                    signTestToken('user-1', {}, 'other-secret')
                ],
                ['an expired token', expiredTestToken('user-1')],
                ['an unsigned (alg=none) token', unsignedTestToken('user-1')],
                ['a token with a tampered payload', tamperedTestToken('user-1')]
            ])('rejects %s and does not call Parse', async (_case, token) => {
                const res = await call(endpoint, bearer(token));

                expect(res.statusCode).toBe(500);
                expect(res._getJSON().code).toBe(
                    SERVER_ERROR_CODE.UNKNOWN_ERROR
                );
                expect(userService.getUserById).not.toHaveBeenCalled();
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });

            it('rejects a valid token of a user that does not exist', async () => {
                const res = await call(
                    endpoint,
                    bearer(signTestToken('deleted-user'))
                );

                expect(res.statusCode).toBe(500);
                expect(mockAxiosPost).not.toHaveBeenCalled();
            });
        });

        describe('with a valid token', () => {
            it('looks the user up by the token subject', async () => {
                await call(endpoint, bearer(signTestToken('user-1')));

                expect(userService.getUserById).toHaveBeenCalledWith('user-1');
            });

            it(`calls ${cloudFunction} with the email of the token's user`, async () => {
                await call(endpoint, bearer(signTestToken('user-1')));

                expect(mockAxiosPost).toHaveBeenCalledWith(
                    cloudFunction,
                    expect.objectContaining({ userEmail: 'owner@lab.de' })
                );
            });

            it('ignores a different user email in the request body', async () => {
                await call(endpoint, bearer(signTestToken('user-1')), {
                    orderId: 'order-1',
                    userEmail: 'someone-else@lab.de'
                });

                const [, payload] = mockAxiosPost.mock.calls[0];
                expect(payload.userEmail).toBe('owner@lab.de');
            });

            it('answers 200 with the Parse result', async () => {
                const res = await call(
                    endpoint,
                    bearer(signTestToken('user-1'))
                );

                expect(res.statusCode).toBe(200);
                expect(res._getJSON()).toEqual({ parse: 'result' });
            });

            it('answers 500 when Parse fails', async () => {
                mockAxiosPost.mockRejectedValue(new Error('Parse down'));

                const res = await call(
                    endpoint,
                    bearer(signTestToken('user-1'))
                );

                expect(res.statusCode).toBe(500);
            });
        });
    });

    describe('getSamplesWithResults', () => {
        it('passes the requested order id on to Parse', async () => {
            await call(
                'getSamplesWithResults',
                bearer(signTestToken('user-1')),
                {
                    orderId: 'order-7'
                }
            );

            expect(mockAxiosPost).toHaveBeenCalledWith(
                'functions/getSamplesWithResults',
                { orderId: 'order-7', userEmail: 'owner@lab.de' }
            );
        });
    });
});
