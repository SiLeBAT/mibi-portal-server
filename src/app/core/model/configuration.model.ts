export interface ApplicationConfiguration {
    appName: string;
    jobRecipient: string;
    login: LoginConfiguration;
    apiUrl: string;
    supportContact: string;
    jwtSecret: string;
}

export interface LoginConfiguration {
    threshold: number;
    secondsDelay: number;
}

export interface ConfigurationPort {}

export interface ConfigurationService extends ConfigurationPort {
    getApplicationConfiguration(): ApplicationConfiguration;
}
