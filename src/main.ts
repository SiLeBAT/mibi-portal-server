import config from 'config';
import path from 'path';
import { logger, getContainer } from './aspects';
import {
    getServerContainerModule,
    API_ROUTE,
    validateToken
} from './ui/server/ports';
import {
    createParseDataStore,
    getPersistenceContainerModule,
    MailService,
    initialiseCatalogRepository,
    initialiseSearchAliasRepository,
    getMailContainerModule,
    MAIL_TYPES
} from './infrastructure/ports';
import {
    createApplication,
    MiBiApplication,
    getApplicationContainerModule
} from './app/ports';
import {
    SystemConfigurationService,
    LoginConfiguration,
    GeneralConfiguration,
    ServerConfiguration,
    MailConfiguration,
    AppConfiguration,
    DataStoreConfiguration,
    ParseConnectionConfiguration
} from './main.model';
import {
    createServer,
    ServerConfiguration as ExpressServerConfiguration
} from '@SiLeBAT/fg43-ne-server';

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

    getParseConnectionConfiguration(): ParseConnectionConfiguration {
        return config.get('parseConnection');
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
            appConfiguration.login.threshold =
                this.loginConfigurationDefaults.threshold;
        }

        if (!config.has('application.login.secondsDelay')) {
            appConfiguration.login.secondsDelay =
                this.loginConfigurationDefaults.secondsDelay;
        }

        return appConfiguration;
    }

    getGeneralConfiguration(): GeneralConfiguration {
        let generalConfiguration: GeneralConfiguration = config.get('general');

        if (!config.has('general')) {
            generalConfiguration = {
                logLevel: this.generalConfigurationDefaults.logLevel,
                supportContact:
                    this.generalConfigurationDefaults.supportContact,
                jwtSecret: this.generalConfigurationDefaults.jwtSecret
            };
        }

        if (!config.has('general.logLevel')) {
            generalConfiguration.logLevel =
                this.generalConfigurationDefaults.logLevel;
        }

        return generalConfiguration;
    }
}

async function init() {
    const configurationService = new DefaultConfigurationService();
    const serverConfig: ServerConfiguration =
        configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration =
        configurationService.getGeneralConfiguration();
    const dataStoreConfig: DataStoreConfiguration =
        configurationService.getDataStoreConfiguration();
    const parseConnectionConfig: ParseConnectionConfiguration =
        configurationService.getParseConnectionConfiguration();
    const appConfiguration: AppConfiguration =
        configurationService.getApplicationConfiguration();
    const mailConfiguration: MailConfiguration =
        configurationService.getMailConfiguration();

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

    await createParseDataStore({
        serverURL: parseConnectionConfig.serverURL,
        appId: parseConnectionConfig.appId,
        masterKey: parseConnectionConfig.masterKey,
        host: parseConnectionConfig.host,
        database: parseConnectionConfig.database,
        username: parseConnectionConfig.username,
        password: parseConnectionConfig.password,
        authDatabase: parseConnectionConfig.authDatabase

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

    const expressServerConfig: ExpressServerConfiguration = {
        container,
        api: {
            root: serverConfig.apiRoot,
            version: API_ROUTE.V2,
            port: serverConfig.port,
            docPath: '/api-docs'
        },
        logging: {
            logger,
            logLevel: generalConfig.logLevel
        },
        tokenValidation: {
            validator: validateToken,
            jwtSecret: generalConfig.jwtSecret
        },
        publicDir: path.join(__dirname + '/ui/server/public/de')
    };
    const server = createServer(expressServerConfig);
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
