import KcAdminClient from '@keycloak/keycloak-admin-client';
import { DefaultKeycloakOidcService } from '../../app/authentication/application/keycloak-oidc.service';
import { DefaultKeycloakActorsService } from '../../app/authentication/application/keycloak-actors.service';
import { KeycloakOidcPort } from '../../app/authentication/model/oidc.model';
import {
    AdminClientPort,
    AdminUserRepresentation,
    GroupRepresentation,
    KeycloakActorsPort
} from '../../app/authentication/model/keycloak-actors.model';
import { KeycloakServerConfig } from './model/server.model';

// Extracts realm name from an issuer URL of the form {base}/realms/{realm}
function realmFromIssuerUrl(issuerUrl: string): string {
    const match = issuerUrl.match(/\/realms\/([^/]+)/);
    if (!match) {
        throw new Error(`Cannot derive realm from issuerUrl: ${issuerUrl}`);
    }
    return match[1];
}

// Strips the /realms/{realm} suffix to get the Keycloak base URL
function baseUrlFromIssuerUrl(issuerUrl: string): string {
    return issuerUrl.replace(/\/realms\/[^/]+\/?$/, '');
}

/**
 * Builds and authenticates a KcAdminClient using service-account credentials,
 * then wraps it behind AdminClientPort.
 *
 * Called once at startup (awaited in container.setup.ts before the container
 * is loaded), matching the same pattern as createParseDataStore.
 */
export async function buildKeycloakAdminClient(
    config: KeycloakServerConfig
): Promise<AdminClientPort> {
    const realm = realmFromIssuerUrl(config.issuerUrl);
    const kc = new KcAdminClient({
        baseUrl: baseUrlFromIssuerUrl(config.issuerUrl),
        realmName: realm
    });

    const reauth = async () =>
        kc.auth({
            grantType: 'client_credentials',
            clientId: config.adminClientId,
            clientSecret: config.adminClientSecret
        });

    await reauth();

    return adaptSdkClient(kc, reauth);
}

/**
 * Inert AdminClientPort used when the Keycloak integration is disabled.
 *
 * It performs no network calls at construction, so the server boots without a
 * reachable Keycloak. The Keycloak-backed services (actor administration,
 * pending-actor reminder) are only reachable through the OIDC session flow,
 * which never runs in legacy-auth mode — so in practice these methods are
 * never invoked. If one is, it rejects loudly rather than failing silently.
 */
export function buildDisabledAdminClient(): AdminClientPort {
    // eslint-disable-next-line @typescript-eslint/require-await -- rejecting stub; async keeps the port's Promise-returning signature
    const disabled = async (): Promise<never> => {
        throw new Error(
            'Keycloak integration is disabled (keycloak.enabled=false)'
        );
    };
    return {
        users: {
            create: disabled,
            update: disabled,
            addToGroup: disabled,
            executeActionsEmail: disabled,
            find: disabled
        },
        groups: {
            find: disabled,
            create: disabled
        },
        roles: {
            findUsersWithRole: disabled
        }
    };
}

/**
 * Wraps KcAdminClient behind AdminClientPort.
 *
 * Two translation responsibilities:
 *  1. `realm` param on every port call is dropped — the SDK reads realm from
 *     the client instance, set once at construction.
 *  2. `roles.findUsersWithRole({ roleName })` → SDK's `({ name })`.
 *
 * Every call is wrapped in withReauth so an expired service-account token
 * triggers a single re-authentication and then retries transparently.
 */
function adaptSdkClient(
    kc: KcAdminClient,
    reauth: () => Promise<void>
): AdminClientPort {
    async function withReauth<T>(op: () => Promise<T>): Promise<T> {
        try {
            return await op();
        } catch (err: unknown) {
            if (isUnauthorized(err)) {
                await reauth();
                return op();
            }
            throw err;
        }
    }

    return {
        users: {
            create: async payload =>
                withReauth(async () =>
                    kc.users.create(payload).then(r => ({ id: r.id }))
                ),
            update: async (query, payload) =>
                withReauth(async () => kc.users.update(query, payload)),
            addToGroup: async query => {
                await withReauth(async () => kc.users.addToGroup(query));
            },
            executeActionsEmail: async query =>
                withReauth(async () =>
                    kc.users.executeActionsEmail({
                        id: query.id,
                        redirectUri: query.redirectUri,
                        actions: query.actions
                    })
                ),
            find: async query =>
                withReauth(async () =>
                    kc.users
                        .find({ enabled: query.enabled })
                        .then(us => us as AdminUserRepresentation[])
                )
        },
        groups: {
            find: async query =>
                withReauth(async () =>
                    kc.groups
                        .find({ search: query.search })
                        .then(gs => gs as GroupRepresentation[])
                ),
            create: async payload =>
                withReauth(async () =>
                    kc.groups
                        .create({ name: payload.name, path: payload.path })
                        .then(r => ({ id: r.id }))
                )
        },
        roles: {
            findUsersWithRole: async query =>
                withReauth(async () =>
                    kc.roles
                        .findUsersWithRole({ name: query.roleName })
                        .then(us => (us ?? []) as AdminUserRepresentation[])
                )
        }
    };
}

function isUnauthorized(err: unknown): boolean {
    return (
        err instanceof Object &&
        'response' in err &&
        (err as { response: { status: number } }).response.status === 401
    );
}

export interface KeycloakServices {
    keycloakOidcService: KeycloakOidcPort;
    keycloakActorsService: KeycloakActorsPort;
}

export function createKeycloakServices(
    config: KeycloakServerConfig,
    adminClient: AdminClientPort
): KeycloakServices {
    return {
        keycloakOidcService: new DefaultKeycloakOidcService(config),
        keycloakActorsService: new DefaultKeycloakActorsService(
            adminClient,
            realmFromIssuerUrl(config.issuerUrl)
        )
    };
}
