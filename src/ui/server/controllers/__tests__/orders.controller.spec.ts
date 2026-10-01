import '../../middleware/session.augment';
import axios from 'axios';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { OrdersController } from '../../model/controller.model';
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
