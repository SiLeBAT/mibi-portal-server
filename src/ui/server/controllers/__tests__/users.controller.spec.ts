import { Container } from 'inversify';
import { getApplicationContainerModule } from '../../../../app/ports';
import { createContainer } from '../../../../aspects/container/container';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
import { getServerContainerModule } from '../../server.module';
import { SERVER_TYPES } from '../../server.types';
import { UsersController } from '../../model/controller.model';

describe('UsersController', () => {
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
                supportContact: 'test',
                parseAPI: '',
                appId: ''
            }),
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: { threshold: 0, secondsDelay: 0 },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }),
            mockPersistenceContainerModule
        );
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
