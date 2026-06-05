/// <reference types='jest' />

import mockRes from 'mock-express-response';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { SystemInfoController } from '../../model/controller.model';
import { SERVER_TYPES } from '../../server.types';

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
