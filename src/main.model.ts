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

export interface SystemConfigurationService {
    getServerConfiguration(): ServerConfiguration;
    getDataStoreConfiguration(): DataStoreConfiguration;
    getApplicationConfiguration(): AppConfiguration;
    getGeneralConfiguration(): GeneralConfiguration;
    getMailConfiguration(): MailConfiguration;
}
