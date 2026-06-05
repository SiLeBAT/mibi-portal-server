import { ApplicationServices } from '../../app/application.factory';
import { DefaultClientDashboardController } from './controllers/client-dashboard.controller';
import { DefaultSystemInfoController } from './controllers/info.controller';
import { DefaultInstituteController } from './controllers/institutes.controller';
import { DefaultKeycloakAdminController } from './controllers/keycloak-admin.controller';
import { DefaultKeycloakAuthController } from './controllers/keycloak-auth.controller';
import { DefaultNRLsController } from './controllers/nrls.controller';
import { DefaultOrdersController } from './controllers/orders.controller';
import { DefaultSamplesController } from './controllers/samples.controller';
import { DefaultTokensController } from './controllers/tokens.controller';
import { DefaultUsersController } from './controllers/users.controller';
import { DefaultVersionRootController } from './controllers/version-root.controller';
import { DefaultZomoPlanFilesController } from './controllers/zomo-plan-files.controller';
import { KeycloakServices } from './keycloak.module';
import {
    ClientDashboardController,
    InstitutesController,
    KeycloakAdminController,
    KeycloakAuthController,
    NRLsController,
    OrdersController,
    SamplesController,
    SystemInfoController,
    TokensController,
    UsersController,
    VersionRootController,
    ZomoPlanFilesController
} from './model/controller.model';
import { AppServerConfiguration } from './model/server.model';

export interface Controllers {
    versionRoot: VersionRootController;
    systemInfo: SystemInfoController;
    institutes: InstitutesController;
    clientDashboard: ClientDashboardController;
    nrls: NRLsController;
    orders: OrdersController;
    tokens: TokensController;
    zomoPlanFiles: ZomoPlanFilesController;
    samples: SamplesController;
    users: UsersController;
    keycloakAuth: KeycloakAuthController;
    keycloakAdmin: KeycloakAdminController;
}

export function createControllers(
    serverConfig: AppServerConfiguration,
    appServices: ApplicationServices,
    keycloakServices: KeycloakServices
): Controllers {
    return {
        versionRoot: new DefaultVersionRootController(serverConfig),
        systemInfo: new DefaultSystemInfoController(serverConfig),
        institutes: new DefaultInstituteController(serverConfig),
        clientDashboard: new DefaultClientDashboardController(serverConfig),
        nrls: new DefaultNRLsController(serverConfig),
        orders: new DefaultOrdersController(
            appServices.tokenService,
            appServices.userService,
            serverConfig
        ),
        tokens: new DefaultTokensController(appServices.tokenService),
        zomoPlanFiles: new DefaultZomoPlanFilesController(serverConfig),
        samples: new DefaultSamplesController(
            appServices.tokenService,
            appServices.userService,
            serverConfig
        ),
        users: new DefaultUsersController(
            appServices.passwordService,
            appServices.loginService,
            appServices.registrationService,
            serverConfig
        ),
        keycloakAuth: new DefaultKeycloakAuthController(
            keycloakServices.keycloakOidcService,
            serverConfig
        ),
        keycloakAdmin: new DefaultKeycloakAdminController(
            keycloakServices.keycloakActorsService
        )
    };
}
