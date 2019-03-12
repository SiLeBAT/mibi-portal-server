// npm
import * as config from 'config';

// local
import {
    createApplication,
    IServerConfig,
    DefaultControllerFactory
} from './ui/server';
import {
    DataStoreType,
    createDataStore,
    registerListeners,
    initialiseCatalogRepository,
    catalogRepository,
    nrlRepository,
    stateRepository,
    institutionRepository,
    userRepository,
    tokenRepository,
    validationErrorRepository
} from './infrastructure';
import {
    ServiceFactory,
    CatalogRepository,
    INotificationPort
} from './app/ports';
import { logger } from './aspects';

initialiseCatalogRepository()
    .then((repo: CatalogRepository) => {
        const serverConfig: IServerConfig = config.get('server');

        const primaryDataStore = createDataStore(DataStoreType.MONGO);
        primaryDataStore.initialize(config.get('dataStore.connectionString'));

        const serviceFactory = new ServiceFactory({
            catalogRepository,
            nrlRepository,
            stateRepository,
            institutionRepository,
            userRepository,
            tokenRepository,
            validationErrorRepository
        });
        serverConfig.controllerFactory = new DefaultControllerFactory(
            serviceFactory
        );

        registerListeners(serviceFactory.getService(
            'NOTIFICATION'
        ) as INotificationPort);

        const application = createApplication(serverConfig);
        application.startServer();

        process.on('uncaughtException', err => {
            logger.error(`Uncaught Exception. error=${err}`);
            process.exit(1);
        });
    })
    .catch((err: Error) => {
        throw new Error(`Unable to start server error=${err}`);
    });
