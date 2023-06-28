/// <reference types='jest' />

import { Container } from 'inversify';
import mockReq from 'mock-express-request';
import mockRes from 'mock-express-response';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { InstitutesController } from '../../model/controller.model';
import { getServerContainerModule } from '../../server.module';
import { SERVER_TYPES } from '../../server.types';

// tslint:disable
describe('Institution controller', () => {
    let controller: InstitutesController;

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
        controller = container.get<InstitutesController>(
            SERVER_TYPES.InstitutesController
        );
    });
    afterEach(() => {
        container = null;
    });

    it('should respond with list of institutes', function () {
        const req = new mockReq({
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        });
        const res = new mockRes();
        expect.assertions(2);
        return controller.getInstitutes(req, res).then(success => {
            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body).toHaveProperty('institutes');
        });
    });
});
