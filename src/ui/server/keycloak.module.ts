import { ContainerModule, interfaces } from 'inversify';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { APPLICATION_TYPES } from '../../app/application.types';
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

export function getKeycloakContainerModule(
    config: KeycloakServerConfig,
    adminClient: AdminClientPort
): ContainerModule {
    return new ContainerModule((bind: interfaces.Bind) => {
        bind<KeycloakOidcPort>(APPLICATION_TYPES.KeycloakOidcService)
            .toDynamicValue(() => new DefaultKeycloakOidcService(config))
            .inSingletonScope();

        bind<KeycloakActorsPort>(APPLICATION_TYPES.KeycloakActorsService)
            .toDynamicValue(() => {
                const realm = realmFromIssuerUrl(config.issuerUrl);
                return new DefaultKeycloakActorsService(adminClient, realm);
            })
            .inSingletonScope();
    });
}
