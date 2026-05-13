import { Client, Issuer, generators } from 'openid-client';
import { injectable } from 'inversify';
import {
    KeycloakOidcPort,
    OidcAuthParams,
    OidcUser
} from '../model/oidc.model';
import { KeycloakServerConfig } from '../../../ui/server/model/server.model';

@injectable()
export class DefaultKeycloakOidcService implements KeycloakOidcPort {
    private clientPromise: Promise<Client>;

    constructor(private readonly config: KeycloakServerConfig) {
        this.clientPromise = this.buildClient();
    }

    async buildAuthorizationUrl(): Promise<OidcAuthParams> {
        const client = await this.clientPromise;
        const codeVerifier = generators.codeVerifier();
        const codeChallenge = generators.codeChallenge(codeVerifier);
        const state = generators.state();
        const authorizationUrl = client.authorizationUrl({
            scope: 'openid email profile',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            state
        });
        return { authorizationUrl, state, codeVerifier };
    }

    async exchangeCode(
        code: string,
        state: string,
        codeVerifier: string,
        iss?: string
    ): Promise<OidcUser> {
        const client = await this.clientPromise;
        const params: Record<string, string> = { code, state };
        if (iss) {
            params.iss = iss;
        }
        const tokenSet = await client.callback(
            this.config.callbackUrl,
            params,
            { code_verifier: codeVerifier, state }
        );
        const claims = tokenSet.claims();
        const realmAccess = claims.realm_access as
            | { roles?: string[] }
            | undefined;
        return {
            sub: claims.sub,
            email: claims.email ?? '',
            preferred_username: (claims.preferred_username as string) ?? '',
            id_token: tokenSet.id_token,
            groups: (claims.groups as string[]) ?? [],
            roles: realmAccess?.roles ?? []
        };
    }

    getEndSessionUrl(idToken?: string): string {
        // Keycloak end-session endpoint is at {issuerUrl}/protocol/openid-connect/logout
        const base = this.config.issuerUrl.replace(/\/$/, '');
        const url = `${base}/protocol/openid-connect/logout`;
        if (idToken && this.config.clientUrl) {
            return `${url}?id_token_hint=${encodeURIComponent(
                idToken
            )}&post_logout_redirect_uri=${encodeURIComponent(
                this.config.clientUrl
            )}`;
        }
        return url;
    }

    private async buildClient(): Promise<Client> {
        const issuer = await Issuer.discover(this.config.issuerUrl);
        return new issuer.Client({
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            redirect_uris: [this.config.callbackUrl],
            response_types: ['code']
        });
    }
}
