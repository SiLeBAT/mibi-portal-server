/// <reference types='jest' />

import { Container } from 'inversify';
import mockRes from 'mock-express-response';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { SystemInfoController } from '../../model/controller.model';
import { getServerContainerModule } from '../../server.module';
import { SERVER_TYPES } from '../../server.types';

// tslint:disable
describe('Info controller', () => {
    let controller: SystemInfoController;

    let container: Container | null;
    beforeEach(() => {
        container = createContainer();
        container.load(
            getServerContainerModule({
                port: 1,
                apiRoot: '',
                publicAPIDoc: {},
                jwtSecret: 'test',
                logLevel: 'info',
                supportContact: 'test'
            }),
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }),
            mockPersistenceContainerModule
        );
        controller = container.get<SystemInfoController>(
            SERVER_TYPES.InfoController
        );
    });
    afterEach(() => {
        container = null;
    });

    it('should respond with JSON', function () {
        const res = new mockRes();
        expect.assertions(4);
        controller.getSystemInfo(res);
        expect(res.statusCode).toBe(200);
        const body = res._getJSON();
        expect(body).toHaveProperty('version');
        expect(body).toHaveProperty('supportContact');
        expect(body).toHaveProperty('lastChange');
    });
});
