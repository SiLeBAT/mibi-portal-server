export interface APIDocConfig {
    [keys: string]: string[];
}

export interface KeycloakServerConfig {
    enabled?: boolean;
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
    // Version segment of every API route, without slashes: 'v2' -> /v2/info.
    apiVersion: string;
    publicAPIDoc: APIDocConfig;
    jwtSecret: string;
    logLevel: string;
    supportContact: string;
    parseAPI: string;
    appId: string;
    clientUrl?: string;
    keycloak?: KeycloakServerConfig;
}
