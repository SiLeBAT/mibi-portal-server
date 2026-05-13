export interface OidcUser {
    sub: string;
    email: string;
    preferred_username: string;
    id_token?: string;
    groups: string[];
    roles: string[];
}

export interface OidcAuthParams {
    authorizationUrl: string;
    state: string;
    codeVerifier: string;
}

export interface KeycloakOidcPort {
    buildAuthorizationUrl(): Promise<OidcAuthParams>;
    exchangeCode(
        code: string,
        state: string,
        codeVerifier: string,
        iss?: string
    ): Promise<OidcUser>;
    getEndSessionUrl(idToken?: string): string;
}
