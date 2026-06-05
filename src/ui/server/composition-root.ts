import { createApplication, createApplicationServices } from '../../app/ports';
import { ActorContextService } from '../../app/authentication/model/actor.model';
import { KeycloakActorsPort } from '../../app/authentication/model/keycloak-actors.model';
import { NotificationService } from '../../app/core/model/notification.model';
import { MailPendingActorDigest } from '../../app/authentication/application/mail-pending-actor-digest';
import { PendingActorReminderJob } from '../../app/authentication/application/pending-actor-reminder.job';
import { logger } from '../../aspects';
import { configurationService } from '../../configuratioin.service';
import {
    MailService,
    createMailService,
    createParseDataStore,
    createPersistenceRepositories
} from '../../infrastructure/ports';
import {
    AppConfiguration,
    GeneralConfiguration,
    KeycloakConfiguration,
    MailConfiguration,
    ParseConnectionConfiguration,
    ServerConfiguration
} from '../../main.model';
import {
    buildDisabledAdminClient,
    buildKeycloakAdminClient,
    createKeycloakServices
} from './keycloak.module';
import { AppServerConfiguration } from './model/server.model';
import { Controllers, createControllers } from './server.factory';

/**
 * Result of wiring the application together: everything express.setup needs to
 * stand up the HTTP layer.
 */
export interface AppComposition {
    controllers: Controllers;
    actorContextService: ActorContextService;
}

/**
 * Composition root: constructs the full object graph by hand (no DI container).
 */
export async function initialiseServices(): Promise<AppComposition> {
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

    // When Keycloak is disabled the server must boot without contacting it, so
    // we skip the eager admin-client authentication and use an inert stub.
    const adminClient = keycloakConfig.enabled
        ? await buildKeycloakAdminClient(keycloakConfig)
        : buildDisabledAdminClient();

    if (keycloakConfig.enabled) {
        logger.info('Keycloak IAM integration enabled');
    } else {
        logger.info(
            'Keycloak IAM integration disabled — running on legacy JWT auth'
        );
    }

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

    const repositories = createPersistenceRepositories();

    const appServices = createApplicationServices(
        {
            ...appConfiguration,
            supportContact: generalConfig.supportContact,
            jwtSecret: generalConfig.jwtSecret
        },
        repositories
    );

    const mailService: MailService = createMailService(mailConfiguration);

    const keycloakServices = createKeycloakServices(
        { ...keycloakConfig, clientUrl: appConfiguration.clientUrl ?? '' },
        adminClient
    );

    const serverConfiguration: AppServerConfiguration = {
        ...serverConfig,
        jwtSecret: generalConfig.jwtSecret,
        logLevel: generalConfig.logLevel,
        supportContact: generalConfig.supportContact,
        parseAPI: parseConnectionConfig.serverURL,
        appId: parseConnectionConfig.appId,
        clientUrl: appConfiguration.clientUrl,
        keycloak: keycloakConfig
    };

    const controllers = createControllers(
        serverConfiguration,
        appServices,
        keycloakServices
    );

    const application = createApplication(appServices.notificationService);
    application.addNotificationHandler(
        mailService.getMailHandler().bind(mailService)
    );

    if (keycloakConfig.enabled) {
        startPendingActorReminderJob(
            appServices.notificationService,
            keycloakServices.keycloakActorsService,
            keycloakConfig,
            appConfiguration
        );
    }

    return {
        controllers,
        actorContextService: appServices.actorContextService
    };
}

function startPendingActorReminderJob(
    notificationService: NotificationService,
    actorsService: KeycloakActorsPort,
    keycloakConfig: KeycloakConfiguration,
    appConfiguration: AppConfiguration
): void {
    const { olderThanDays, scheduleHours } = keycloakConfig.reminder;
    const olderThanMs = olderThanDays * 24 * 60 * 60 * 1000;
    const windowMs = scheduleHours * 60 * 60 * 1000;

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
