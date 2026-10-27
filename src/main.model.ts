import { APIDocConfig } from './ui/server/ports';

export interface ServerConfiguration {
    port: number;
    apiRoot: string;
    publicAPIDoc: APIDocConfig;
}

export interface DataStoreConfiguration {
    dataDir: string;
}

export interface ParseConnectionConfiguration {
    serverURL: string;
    appId: string;
    masterKey: string;
    host: string;
    database: string;
    username: string;
    password: string;
    authDatabase: string;
}

export interface GeneralConfiguration {
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
    // Shared secret guarding POST /v2/orders/results, the machine-to-machine
    // route used to import BfR analysis results. Empty means the route rejects
    // every request: it must fail closed, because behind it sits a write path
    // that runs with the Parse master key.
    resultsApiKey: string;
}

export interface AppConfiguration {
    appName: string;
    jobRecipient: string;
    login: LoginConfiguration;
    clientUrl: string;
}

export interface LoginConfiguration {
    threshold: number;
    secondsDelay: number;
}

export interface MailConfiguration {
    fromAddress: string;
    replyToAddress: string;
}

export interface ReminderConfiguration {
    olderThanDays: number;
    scheduleHours: number;
}

export interface KeycloakConfiguration {
    // Master switch for the Keycloak IAM integration. While false (the default),
    // the server boots and runs entirely on the legacy JWT auth stack and never
    // contacts Keycloak at startup — no admin-client authentication, no reminder
    // job. Flip to true (e.g. MIBI_KEYCLOAK_ENABLED=true) once a reachable
    // Keycloak server is available to activate the BFF/OIDC flow.
    enabled: boolean;
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    adminClientId: string;
    adminClientSecret: string;
    reminder: ReminderConfiguration;
}

export interface SessionConfiguration {
    secret: string;
    ttlSeconds: number;
}

export interface SystemConfigurationService {
    getServerConfiguration(): ServerConfiguration;
    getDataStoreConfiguration(): DataStoreConfiguration;
    getApplicationConfiguration(): AppConfiguration;
    getGeneralConfiguration(): GeneralConfiguration;
    getMailConfiguration(): MailConfiguration;
    getKeycloakConfiguration(): KeycloakConfiguration;
    getSessionConfiguration(): SessionConfiguration;
}
