import 'reflect-metadata';
import { DefaultKeycloakOidcService } from '../keycloak-oidc.service';

jest.mock('openid-client', () => ({
    Issuer: {
        discover: jest.fn().mockResolvedValue({
            Client: jest.fn().mockImplementation(() => ({}))
        })
    },
    generators: {
        codeVerifier: jest.fn(),
        codeChallenge: jest.fn(),
        state: jest.fn()
    }
}));

const BASE_CONFIG = {
    issuerUrl: 'https://keycloak.example.com/realms/mibi',
    clientId: 'mibi-portal-bff',
    clientSecret: 'secret',
    callbackUrl: 'http://localhost:3000/v2/auth/callback'
};

describe('DefaultKeycloakOidcService.getEndSessionUrl', () => {
    it('returns base logout URL when no id_token given', () => {
        const svc = new DefaultKeycloakOidcService(BASE_CONFIG);
        expect(svc.getEndSessionUrl()).toBe(
            'https://keycloak.example.com/realms/mibi/protocol/openid-connect/logout'
        );
    });

    it('appends id_token_hint and post_logout_redirect_uri when id_token given', () => {
        const svc = new DefaultKeycloakOidcService(BASE_CONFIG);
        const result = svc.getEndSessionUrl('tok-123');

        expect(result).toContain('id_token_hint=tok-123');
        expect(result).toContain(
            'post_logout_redirect_uri=' +
                encodeURIComponent('http://localhost:3000/v2/auth')
        );
    });

    it('strips trailing slash from issuerUrl before building URL', () => {
        const svc = new DefaultKeycloakOidcService({
            ...BASE_CONFIG,
            issuerUrl: 'https://keycloak.example.com/realms/mibi/'
        });
        expect(svc.getEndSessionUrl()).toBe(
            'https://keycloak.example.com/realms/mibi/protocol/openid-connect/logout'
        );
    });

    it('URL-encodes special characters in id_token', () => {
        const svc = new DefaultKeycloakOidcService(BASE_CONFIG);
        const result = svc.getEndSessionUrl('a+b=c');
        expect(result).toContain('id_token_hint=a%2Bb%3Dc');
    });
});
