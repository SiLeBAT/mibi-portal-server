import '../../middleware/session.augment';
import axios from 'axios';
import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { SamplesController } from '../../model/controller.model';
import { getServerContainerModule } from '../../server.module';
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

function buildController(container: Container): SamplesController {
    return container.get<SamplesController>(SERVER_TYPES.SamplesController);
}

describe('DefaultSamplesController', () => {
    let container: Container | null;
    let mockAxiosPost: jest.Mock;

    beforeEach(() => {
        mockAxiosPost = jest.fn().mockResolvedValue({ data: { result: {} } });
        (axios.create as unknown as jest.Mock).mockReturnValue({
            post: mockAxiosPost
        });

        container = createContainer();
        container.load(
            getServerContainerModule(SERVER_CONFIG as any),
            getApplicationContainerModule(APP_CONFIG),
            mockPersistenceContainerModule
        );
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
    });
});
