/// <reference types='jest' />

import mockRes from 'mock-express-response';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { SystemInfoController } from '../../model/controller.model';
import { SERVER_TYPES } from '../../server.types';

// Answers a system info request with the given date of last change in package.json.
function readLastChangeFrom(lastChange: string) {
    let res = new mockRes();
    jest.isolateModules(() => {
        jest.doMock('../../../../../package.json', () => ({
            version: '1.0.0',
            mibiConfig: { lastChange }
        }));
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { DefaultSystemInfoController } = require('../info.controller');
        res = new mockRes();
        new DefaultSystemInfoController({
            supportContact: 'test'
        }).getSystemInfo(res);
    });
    return { statusCode: res.statusCode, body: res._getJSON() };
}

// tslint:disable
describe('Info controller', () => {
    let controller: SystemInfoController;

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
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }
        });
        controller = container.get<SystemInfoController>(
            SERVER_TYPES.InfoController
        );
    });
    afterEach(() => {
        container = null;
    });

    it('should respond with JSON', function () {
        const res = new mockRes();
        expect.assertions(5);
        controller.getSystemInfo(res);
        expect(res.statusCode).toBe(200);
        const body = res._getJSON();
        expect(body).toHaveProperty('version');
        expect(body).toHaveProperty('supportContact');
        expect(body).toHaveProperty('lastChange');
        expect(body).toHaveProperty('keycloakEnabled');
    });

    it('sends the date of last change as ISO 8601 in UTC', function () {
        const res = new mockRes();
        controller.getSystemInfo(res);
        const lastChange = res._getJSON().lastChange;
        expect(lastChange).toMatch(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        );
        expect(new Date(lastChange).toISOString()).toBe(lastChange);
    });

    it('converts the package.json format including its offset', function () {
        const lastChange = readLastChangeFrom('2019-04-16 11:25:17 +0200');
        expect(lastChange.statusCode).toBe(200);
        expect(lastChange.body.lastChange).toBe('2019-04-16T09:25:17.000Z');
    });

    it('fails when the date of last change cannot be read', function () {
        const lastChange = readLastChangeFrom('16.04.2019');
        expect(lastChange.statusCode).toBe(500);
    });

    it('defaults keycloakEnabled to false when no keycloak config is present', function () {
        const res = new mockRes();
        controller.getSystemInfo(res);
        expect(res._getJSON().keycloakEnabled).toBe(false);
    });

    it('reflects keycloak.enabled from the server configuration', function () {
        const enabledContainer = createTestContainer({
            serverConfig: {
                port: 1,
                apiRoot: '',
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test',
                parseAPI: '',
                appId: '',
                keycloak: {
                    enabled: true,
                    issuerUrl: '',
                    clientId: '',
                    clientSecret: '',
                    callbackUrl: '',
                    adminClientId: '',
                    adminClientSecret: ''
                }
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
        const enabledController = enabledContainer.get<SystemInfoController>(
            SERVER_TYPES.InfoController
        );
        const res = new mockRes();
        enabledController.getSystemInfo(res);
        expect(res._getJSON().keycloakEnabled).toBe(true);
    });
});
