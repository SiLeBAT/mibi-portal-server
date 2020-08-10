import config from 'config';
import {
    createApplication,
    getApplicationContainerModule,
    MiBiApplication
} from './app/ports';
import { getContainer, logger } from './aspects';
import {
    createDataStore,
    getMailContainerModule,
    getPersistenceContainerModule,
    initialiseCatalogRepository,
    initialiseSearchAliasRepository,
    MailService,
    MAIL_TYPES
} from './infrastructure/ports';
import {
    AppConfiguration,
    DataStoreConfiguration,
    GeneralConfiguration,
    LoginConfiguration,
    MailConfiguration,
    ServerConfiguration,
    SystemConfigurationService
} from './main.model';
import { createServer, getServerContainerModule } from './ui/server/ports';

export class DefaultConfigurationService implements SystemConfigurationService {
    private loginConfigurationDefaults: LoginConfiguration = {
        threshold: 5,
        secondsDelay: 300
    };

    private generalConfigurationDefaults: GeneralConfiguration = {
        logLevel: 'info',
        supportContact: '',
        jwtSecret: ''
    };

    getServerConfiguration(): ServerConfiguration {
        return config.get('server');
    }

    getDataStoreConfiguration(): DataStoreConfiguration {
        return config.get('dataStore');
    }

    getMailConfiguration(): MailConfiguration {
        return config.get('mail');
    }

    getApplicationConfiguration(): AppConfiguration {
        const appConfiguration: AppConfiguration = config.get('application');

        if (!config.has('application.jobRecipient')) {
            appConfiguration.jobRecipient = '';
        }

        if (!config.has('application.login')) {
            appConfiguration.login = {
                threshold: this.loginConfigurationDefaults.threshold,
                secondsDelay: this.loginConfigurationDefaults.secondsDelay
            };
        }

        if (!config.has('application.login.threshold')) {
            appConfiguration.login.threshold = this.loginConfigurationDefaults.threshold;
        }

        if (!config.has('application.login.secondsDelay')) {
            appConfiguration.login.secondsDelay = this.loginConfigurationDefaults.secondsDelay;
        }

        return appConfiguration;
    }

    getGeneralConfiguration(): GeneralConfiguration {
        let generalConfiguration: GeneralConfiguration = config.get('general');

        if (!config.has('general')) {
            generalConfiguration = {
                logLevel: this.generalConfigurationDefaults.logLevel,
                supportContact: this.generalConfigurationDefaults
                    .supportContact,
                jwtSecret: this.generalConfigurationDefaults.jwtSecret
            };
        }

        if (!config.has('general.logLevel')) {
            generalConfiguration.logLevel = this.generalConfigurationDefaults.logLevel;
        }

        return generalConfiguration;
    }
}

async function init() {
    const configurationService = new DefaultConfigurationService();
    const serverConfig: ServerConfiguration = configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration = configurationService.getGeneralConfiguration();
    const dataStoreConfig: DataStoreConfiguration = configurationService.getDataStoreConfiguration();
    const appConfiguration: AppConfiguration = configurationService.getApplicationConfiguration();
    const mailConfiguration: MailConfiguration = configurationService.getMailConfiguration();

    logger.info(`Starting MiBi-Portal. appName=${appConfiguration.appName}`);

    const catalogRepository = await initialiseCatalogRepository(
        dataStoreConfig.dataDir
    ).catch((error: Error) => {
        logger.error(
            `Failed to initialize Catalog Repository. error=${String(error)}`
        );
        throw error;
    });

    const searchAliasRepository = await initialiseSearchAliasRepository(
        dataStoreConfig.dataDir
    ).catch((error: Error) => {
        logger.error(
            `Failed to initialize Search Alias Repository. error=${String(
                error
            )}`
        );
        throw error;
    });

    createDataStore({
        host: dataStoreConfig.host,
        database: dataStoreConfig.dataBase,
        username: dataStoreConfig.username,
        password: dataStoreConfig.password,
        authDatabase: dataStoreConfig.authDatabase
    });

    const container = getContainer({ defaultScope: 'Singleton' });

    container.load(
        getApplicationContainerModule({
            ...appConfiguration,
            supportContact: generalConfig.supportContact,
            jwtSecret: generalConfig.jwtSecret
        }),
        getPersistenceContainerModule({
            searchAliasRepository,
            catalogRepository,
            dataDir: dataStoreConfig.dataDir
        }),
        getServerContainerModule({
            ...serverConfig,
            jwtSecret: generalConfig.jwtSecret,
            logLevel: generalConfig.logLevel,
            supportContact: generalConfig.supportContact
        }),
        getMailContainerModule(mailConfiguration)
    );

    const application: MiBiApplication = createApplication(container);

    const mailService = container.get<MailService>(MAIL_TYPES.MailService);
    application.addNotificationHandler(
        mailService.getMailHandler().bind(mailService)
    );

    const server = createServer(container);
    server.startServer();

    process.on('uncaughtException', error => {
        logger.error(`Uncaught Exception. error=${String(error)}`);
        process.exit(1);
    });
}

init().catch(error => {
    logger.error(`Unable to initialise application. error=${error}`);
    throw error;
});
