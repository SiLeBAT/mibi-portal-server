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
    callbackUrl: 'http://localhost:3000/v2/auth/callback',
    adminClientId: 'mibi-portal-admin',
    adminClientSecret: 'admin-secret'
};

describe('DefaultKeycloakOidcService.exchangeCode', () => {
    it('extracts realm_access roles into OidcUser.roles', async () => {
        const { Issuer, generators } = require('openid-client');
        generators.codeVerifier.mockReturnValue('cv');
        generators.codeChallenge.mockReturnValue('cc');
        generators.state.mockReturnValue('st');

        const mockCallback = jest.fn().mockResolvedValue({
            claims: () => ({
                sub: 'u1',
                email: 'u@e.com',
                preferred_username: 'user',
                groups: ['/institutes/BfR'],
                realm_access: { roles: ['mibi-admin', 'offline_access'] }
            }),
            id_token: 'tok'
        });
        Issuer.discover.mockResolvedValue({
            Client: jest
                .fn()
                .mockImplementation(() => ({ callback: mockCallback }))
        });

        const svc = new DefaultKeycloakOidcService(BASE_CONFIG);
        const user = await svc.exchangeCode('code', 'state', 'cv');

        expect(user.roles).toEqual(['mibi-admin', 'offline_access']);
    });

    it('defaults roles to [] when realm_access is absent', async () => {
        const { Issuer } = require('openid-client');

        const mockCallback = jest.fn().mockResolvedValue({
            claims: () => ({
                sub: 'u1',
                email: 'u@e.com',
                preferred_username: 'user',
                groups: []
            }),
            id_token: 'tok'
        });
        Issuer.discover.mockResolvedValue({
            Client: jest
                .fn()
                .mockImplementation(() => ({ callback: mockCallback }))
        });

        const svc = new DefaultKeycloakOidcService(BASE_CONFIG);
        const user = await svc.exchangeCode('code', 'state', 'cv');

        expect(user.roles).toEqual([]);
    });
});

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
