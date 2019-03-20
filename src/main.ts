// local
import { createApplication, DefaultControllerFactory } from './ui/server/ports';
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
    ServiceFactory,
    ServerConfiguration,
    getNotificationService,
    getConfigurationService,
    GeneralConfiguration,
    ApplicationSystemError
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

    const primaryDataStore = createDataStore(DataStoreType.MONGO);
    primaryDataStore.initialize(
        configurationService.getDataStoreConfiguration().connectionString
    );

    const serviceFactory = new ServiceFactory({
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
        new DefaultControllerFactory(serviceFactory)
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
