import {
    ApplicationServices,
    createApplicationServices
} from '../app/application.factory';
import { getMockKeycloakActorsService } from '../app/authentication/application/__mocks__/keycloak-actors.service';
import { getMockKeycloakOidcService } from '../app/authentication/application/__mocks__/keycloak-oidc.service';
import { KeycloakActorsPort } from '../app/authentication/model/keycloak-actors.model';
import { KeycloakOidcPort } from '../app/authentication/model/oidc.model';
import { APPLICATION_TYPES } from '../app/application.types';
import { ApplicationConfiguration } from '../app/core/model/configuration.model';
import { createMockPersistenceRepositories } from '../infrastructure/persistence/__mocks__/persistence-mock.factory';
import { KeycloakServices } from '../ui/server/keycloak.module';
import { AppServerConfiguration } from '../ui/server/model/server.model';
import { Controllers, createControllers } from '../ui/server/server.factory';
import { SERVER_TYPES } from '../ui/server/server.types';

/**
 * Minimal hand-rolled test seam replacing the former inversify container.
 *
 * It assembles application services + controllers from the production factories
 * and exposes the same `get(symbol)` / `rebind(symbol).toConstantValue()` shape
 * the specs (and rebindMocks) rely on. Each `get` rebuilds the graph so that
 * any rebound dependency propagates to the services that consume it.
 */
export interface TestContainer {
    get<T>(id: symbol): T;
    rebind(id: symbol): { toConstantValue(instance: unknown): void };
}

const APP_SERVICE_FIELDS: Partial<Record<symbol, keyof ApplicationServices>> = {
    [APPLICATION_TYPES.ConfigurationService]: 'configurationService',
    [APPLICATION_TYPES.NotificationService]: 'notificationService',
    [APPLICATION_TYPES.UserService]: 'userService',
    [APPLICATION_TYPES.InstituteService]: 'instituteService',
    [APPLICATION_TYPES.TokenService]: 'tokenService',
    [APPLICATION_TYPES.RegistrationService]: 'registrationService',
    [APPLICATION_TYPES.PasswordService]: 'passwordService',
    [APPLICATION_TYPES.LoginService]: 'loginService',
    [APPLICATION_TYPES.ActorContextService]: 'actorContextService'
};

const CONTROLLER_FIELDS: Partial<Record<symbol, keyof Controllers>> = {
    [SERVER_TYPES.InfoController]: 'systemInfo',
    [SERVER_TYPES.InstitutesController]: 'institutes',
    [SERVER_TYPES.NRLsController]: 'nrls',
    [SERVER_TYPES.ClientDashboardController]: 'clientDashboard',
    [SERVER_TYPES.ZomoPlanFilesController]: 'zomoPlanFiles',
    [SERVER_TYPES.UsersController]: 'users',
    [SERVER_TYPES.SamplesController]: 'samples',
    [SERVER_TYPES.OrdersController]: 'orders',
    [SERVER_TYPES.TokensController]: 'tokens',
    [SERVER_TYPES.VersionRootController]: 'versionRoot',
    [SERVER_TYPES.KeycloakAuthController]: 'keycloakAuth',
    [SERVER_TYPES.KeycloakAdminController]: 'keycloakAdmin'
};

export function createTestContainer(opts: {
    appConfig: ApplicationConfiguration;
    serverConfig?: AppServerConfiguration;
}): TestContainer {
    const repositories = createMockPersistenceRepositories();
    const appOverrides: Partial<ApplicationServices> = {};
    let keycloakOidcOverride: KeycloakOidcPort | undefined;
    let keycloakActorsOverride: KeycloakActorsPort | undefined;

    const build = () => {
        const appServices = createApplicationServices(
            opts.appConfig,
            repositories,
            appOverrides
        );
        const keycloakServices: KeycloakServices = {
            keycloakOidcService:
                keycloakOidcOverride ?? getMockKeycloakOidcService(),
            keycloakActorsService:
                keycloakActorsOverride ?? getMockKeycloakActorsService()
        };
        return { appServices, keycloakServices };
    };

    return {
        get<T>(id: symbol): T {
            const { appServices, keycloakServices } = build();

            const appField = APP_SERVICE_FIELDS[id];
            if (appField) {
                return appServices[appField] as unknown as T;
            }
            if (id === APPLICATION_TYPES.KeycloakOidcService) {
                return keycloakServices.keycloakOidcService as unknown as T;
            }
            if (id === APPLICATION_TYPES.KeycloakActorsService) {
                return keycloakServices.keycloakActorsService as unknown as T;
            }

            const controllerField = CONTROLLER_FIELDS[id];
            if (controllerField) {
                if (!opts.serverConfig) {
                    throw new Error(
                        'serverConfig is required to resolve controllers'
                    );
                }
                const controllers = createControllers(
                    opts.serverConfig,
                    appServices,
                    keycloakServices
                );
                return controllers[controllerField] as unknown as T;
            }

            throw new Error(`Unknown service id: ${String(id)}`);
        },
        rebind(id: symbol) {
            return {
                toConstantValue(instance: unknown) {
                    const appField = APP_SERVICE_FIELDS[id];
                    if (appField) {
                        (appOverrides as Record<string, unknown>)[appField] =
                            instance;
                    } else if (id === APPLICATION_TYPES.KeycloakOidcService) {
                        keycloakOidcOverride = instance as KeycloakOidcPort;
                    } else if (id === APPLICATION_TYPES.KeycloakActorsService) {
                        keycloakActorsOverride = instance as KeycloakActorsPort;
                    } else {
                        throw new Error(`Cannot rebind id: ${String(id)}`);
                    }
                }
            };
        }
    };
}
