import { configurationService } from '../../configuratioin.service';
import {
    MiBiApplication,
    createApplication,
    getApplicationContainerModule
} from '../../app/ports';
import { createContainer } from '../../aspects';
import {
    MAIL_TYPES,
    MailService,
    createParseDataStore,
    getMailContainerModule,
    getPersistenceContainerModule
} from '../../infrastructure/ports';
import {
    AppConfiguration,
    DataStoreConfiguration,
    GeneralConfiguration,
    MailConfiguration,
    ParseConnectionConfiguration,
    ServerConfiguration
} from '../../main.model';
import {
    getServerContainerModule
} from './ports';


export async function initialiseContainer(
    // tslint:disable-next-line: no-any
    searchAliasRepository: any,
    // tslint:disable-next-line: no-any
    catalogRepository: any
) {
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

    const container = createContainer({ defaultScope: 'Singleton' });
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
    return container;
}

