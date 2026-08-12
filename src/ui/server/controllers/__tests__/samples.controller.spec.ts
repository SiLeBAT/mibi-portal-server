import '../../middleware/session.augment';
import axios from 'axios';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { SamplesController } from '../../model/controller.model';
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
});
