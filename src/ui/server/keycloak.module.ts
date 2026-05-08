import { ContainerModule, interfaces } from 'inversify';
import { APPLICATION_TYPES } from '../../app/application.types';
import { DefaultKeycloakOidcService } from '../../app/authentication/application/keycloak-oidc.service';
import { DefaultKeycloakActorsService } from '../../app/authentication/application/keycloak-actors.service';
import { KeycloakOidcPort } from '../../app/authentication/model/oidc.model';
import {
    AdminClientPort,
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

export function getKeycloakContainerModule(
    config: KeycloakServerConfig
): ContainerModule {
    return new ContainerModule((bind: interfaces.Bind) => {
        bind<KeycloakOidcPort>(APPLICATION_TYPES.KeycloakOidcService)
            .toDynamicValue(() => new DefaultKeycloakOidcService(config))
            .inSingletonScope();

        // TODO (slice 05): install @keycloak/keycloak-admin-client and replace
        // this placeholder with a real KcAdminClient bound to AdminClientPort.
        // The admin client must be the only place importing that package (ADR-0003).
        bind<KeycloakActorsPort>(APPLICATION_TYPES.KeycloakActorsService)
            .toDynamicValue(() => {
                const adminClient = buildAdminClientPlaceholder();
                const realm = realmFromIssuerUrl(config.issuerUrl);
                return new DefaultKeycloakActorsService(adminClient, realm);
            })
            .inSingletonScope();
    });
}

// Placeholder until @keycloak/keycloak-admin-client is wired (slice 05).
function buildAdminClientPlaceholder(): AdminClientPort {
    const notImplemented = (): never => {
        throw new Error('KcAdminClient not yet wired — see slice 05');
    };
    return {
        users: {
            create: notImplemented,
            update: notImplemented,
            addToGroup: notImplemented,
            executeActionsEmail: notImplemented,
            find: notImplemented
        },
        groups: { find: notImplemented, create: notImplemented },
        roles: { findUsersWithRole: notImplemented }
    };
}
