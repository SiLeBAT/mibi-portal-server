// npm
import * as config from 'config';

// local
import { createApplication, IServerConfig } from './ui/server';
import { DataStoreType, createDataStore, registerListeners, initialiseCatalogRepository } from './infrastructure';
import { ServiceFactory, RepositoryFactory, ICatalogRepository, INotificationPort } from './app/ports';
import { ControllerFactory } from './ui/server/sharedKernel';
import { logger } from './aspects';

initialiseCatalogRepository().then(
    (repo: ICatalogRepository) => {
        const serverConfig: IServerConfig = config.get('server');

        const primaryDataStore = createDataStore(DataStoreType.MONGO);
        primaryDataStore.initialize(config.get('dataStore.connectionString'));

        const repositoryFactory = new RepositoryFactory();
        const serviceFactory = new ServiceFactory(repositoryFactory);
        serverConfig.controllerFactory = new ControllerFactory(serviceFactory);

        registerListeners((serviceFactory.getService('NOTIFICATION') as INotificationPort));

        const application = createApplication(serverConfig);
        application.startServer();

        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception', { error: err });
            process.exit(1);
        });
    }
).catch(
    (err: Error) => {
        throw new Error(`Unable to start server error=${err}`);
    }
);
