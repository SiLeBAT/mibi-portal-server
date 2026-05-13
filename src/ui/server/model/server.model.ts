export interface APIDocConfig {
    [keys: string]: string[];
}

export interface KeycloakServerConfig {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    clientUrl?: string;
    adminClientId: string;
    adminClientSecret: string;
}

export interface AppServerConfiguration {
    port: number;
    apiRoot: string;
    publicAPIDoc: APIDocConfig;
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
    parseAPI: string;
    appId: string;
    clientUrl?: string;
    keycloak?: KeycloakServerConfig;
}
