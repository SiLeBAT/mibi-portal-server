import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { SERVER_TYPES } from '../../server.types';
import { UsersController } from '../../model/controller.model';

describe('UsersController', () => {
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
                login: { threshold: 0, secondsDelay: 0 },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }
        });
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
