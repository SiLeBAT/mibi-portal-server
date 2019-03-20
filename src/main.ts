// local
import {
    createApplication,
    createFactory as createControllerFactory
} from './ui/server/ports';
import {
    DataStoreType,
    createDataStore,
    registerListeners,
    initialiseCatalogRepository,
    initialiseSearchAliasRepository,
    institutionRepository,
    nrlRepository,
    stateRepository,
    userRepository,
    tokenRepository,
    validationErrorRepository
} from './infrastructure/ports';
import {
    createFactory as createServiceFactory,
    ServerConfiguration,
    getNotificationService,
    getConfigurationService,
    GeneralConfiguration,
    ApplicationSystemError,
    DataStoreConfiguration
} from './app/ports';
import { logger } from './aspects';

async function init() {
    const catalogRepository = await initialiseCatalogRepository().catch(
        (err: Error) => {
            throw new Error(`Unable to start server error=${err}`);
        }
    );

    const searchAliasRepository = await initialiseSearchAliasRepository().catch(
        (err: Error) => {
            throw new Error(`Unable to start server error=${err}`);
        }
    );
    const configurationService = getConfigurationService();
    const serverConfig: ServerConfiguration = configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration = configurationService.getGeneralConfiguration();
    const dataStoreConfig: DataStoreConfiguration = configurationService.getDataStoreConfiguration();

    const primaryDataStore = createDataStore(DataStoreType.MONGO);
    primaryDataStore.initialize(dataStoreConfig.connectionString);

    const serviceFactory = createServiceFactory({
        catalogRepository,
        nrlRepository,
        stateRepository,
        institutionRepository,
        userRepository,
        tokenRepository,
        validationErrorRepository,
        searchAliasRepository
    });

    registerListeners(getNotificationService());

    const application = createApplication(
        serverConfig,
        generalConfig,
        createControllerFactory(serviceFactory)
    );
    application.startServer();

    process.on('uncaughtException', err => {
        logger.error(`Uncaught Exception. error=${err}`);
        process.exit(1);
    });
}

init().catch(error => {
    throw new ApplicationSystemError(
        `Unable to initialise application. error=${error}`
    );
});
