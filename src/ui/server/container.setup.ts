import {
    MiBiApplication,
    createApplication,
    getApplicationContainerModule
} from '../../app/ports';
import { createContainer, logger } from '../../aspects';
import { configurationService } from '../../configuratioin.service';
import {
    MAIL_TYPES,
    MailService,
    createParseDataStore,
    getMailContainerModule,
    getPersistenceContainerModule
} from '../../infrastructure/ports';
import {
    AppConfiguration,
    GeneralConfiguration,
    KeycloakConfiguration,
    MailConfiguration,
    ParseConnectionConfiguration,
    ServerConfiguration
} from '../../main.model';
import { getServerContainerModule } from './ports';
import {
    buildKeycloakAdminClient,
    getKeycloakContainerModule
} from './keycloak.module';
import { APPLICATION_TYPES } from '../../app/application.types';
import { NotificationService } from '../../app/core/model/notification.model';
import { KeycloakActorsPort } from '../../app/authentication/model/keycloak-actors.model';
import { MailPendingActorDigest } from '../../app/authentication/application/mail-pending-actor-digest';
import { PendingActorReminderJob } from '../../app/authentication/application/pending-actor-reminder.job';

export async function initialiseContainer() {
    const serverConfig: ServerConfiguration =
        configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration =
        configurationService.getGeneralConfiguration();
    const parseConnectionConfig: ParseConnectionConfiguration =
        configurationService.getParseConnectionConfiguration();
    const appConfiguration: AppConfiguration =
        configurationService.getApplicationConfiguration();
    const mailConfiguration: MailConfiguration =
        configurationService.getMailConfiguration();
    const keycloakConfig: KeycloakConfiguration =
        configurationService.getKeycloakConfiguration();

    const adminClient = await buildKeycloakAdminClient(keycloakConfig);

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
        getPersistenceContainerModule(),
        getServerContainerModule({
            ...serverConfig,
            jwtSecret: generalConfig.jwtSecret,
            logLevel: generalConfig.logLevel,
            supportContact: generalConfig.supportContact,
            parseAPI: parseConnectionConfig.serverURL,
            appId: parseConnectionConfig.appId,
            clientUrl: appConfiguration.clientUrl,
            keycloak: keycloakConfig
        }),
        getMailContainerModule(mailConfiguration),
        getKeycloakContainerModule(
            { ...keycloakConfig, clientUrl: appConfiguration.clientUrl ?? '' },
            adminClient
        )
    );

    const application: MiBiApplication = createApplication(container);

    const mailService = container.get<MailService>(MAIL_TYPES.MailService);
    application.addNotificationHandler(
        mailService.getMailHandler().bind(mailService)
    );

    startPendingActorReminderJob(container, keycloakConfig, appConfiguration);

    return container;
}

function startPendingActorReminderJob(
    container: ReturnType<typeof createContainer>,
    keycloakConfig: KeycloakConfiguration,
    appConfiguration: AppConfiguration
): void {
    const { olderThanDays, scheduleHours } = keycloakConfig.reminder;
    const olderThanMs = olderThanDays * 24 * 60 * 60 * 1000;
    const windowMs = scheduleHours * 60 * 60 * 1000;

    const notificationService = container.get<NotificationService>(
        APPLICATION_TYPES.NotificationService
    );
    const actorsService = container.get<KeycloakActorsPort>(
        APPLICATION_TYPES.KeycloakActorsService
    );
    const digest = new MailPendingActorDigest(
        notificationService,
        appConfiguration.appName,
        appConfiguration.clientUrl
    );
    const job = new PendingActorReminderJob(actorsService, digest, {
        olderThanMs,
        windowMs
    });

    setInterval(() => {
        job.run().catch(err => {
            logger.error('Pending actor reminder job failed', { err });
        });
    }, windowMs);
}
