export interface ServerConfiguration {
    port: number;
    jwtSecret: string;
    apiUrl: string;
}

export interface DataStoreConfiguration {
    connectionString: string;
    dataDir: string;
}

export interface GeneralConfiguration {
    logLevel: string;
    supportContact: string;
}

export interface ApplicationConfiguration {
    appName: string;
    jobRecipient: string;
    login: LoginConfiguration;
}

export interface LoginConfiguration {
    threshold: number;
    secondsDelay: number;
}

export interface MailConfiguration {
    fromAddress: string;
    replyToAddress: string;
}

export interface ConfigurationPort {
    getServerConfiguration(): ServerConfiguration;
    getDataStoreConfiguration(): DataStoreConfiguration;
    getApplicationConfiguration(): ApplicationConfiguration;
    getGeneralConfiguration(): GeneralConfiguration;
    getMailConfiguration(): MailConfiguration;
}

export interface ConfigurationService extends ConfigurationPort {}
