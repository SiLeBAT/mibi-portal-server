import { OidcAuthParams, OidcUser } from '../../model/oidc.model';

export function getMockKeycloakOidcService() {
    return {
        buildAuthorizationUrl: jest.fn(
            (): Promise<OidcAuthParams> =>
                Promise.resolve({
                    authorizationUrl: 'https://keycloak.example.com/auth',
                    state: 'test-state',
                    codeVerifier: 'test-verifier'
                })
        ),
        exchangeCode: jest.fn(
            (): Promise<OidcUser> =>
                Promise.resolve({
                    sub: 'user-123',
                    email: 'user@example.com',
                    preferred_username: 'testuser',
                    id_token: 'id-token-xyz',
                    groups: ['/institutes/BfR'],
                    roles: ['mibi-admin']
                })
        ),
        getEndSessionUrl: jest.fn(
            (): string => 'https://keycloak.example.com/logout'
        )
    };
}
