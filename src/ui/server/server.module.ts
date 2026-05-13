import { RequestHandler } from 'express';
import { ContainerModule, interfaces } from 'inversify';
import { DefaultClientDashboardController } from './controllers/client-dashboard.controller';
import { DefaultSystemInfoController } from './controllers/info.controller';
import { DefaultInstituteController } from './controllers/institutes.controller';
import { DefaultKeycloakAdminController } from './controllers/keycloak-admin.controller';
import { DefaultKeycloakAuthController } from './controllers/keycloak-auth.controller';
import { DefaultNRLsController } from './controllers/nrls.controller';
import { DefaultOrdersController } from './controllers/orders.controller';
import { DefaultSamplesController } from './controllers/samples.controller';
import { DefaultUsersController } from './controllers/users.controller';
import { DefaultVersionRootController } from './controllers/version-root.controller';
import { DefaultZomoPlanFilesController } from './controllers/zomo-plan-files.controller';
import { uploadToMemory } from './middleware/file-upload.middleware';
import {
    ClientDashboardController,
    InstitutesController,
    KeycloakAdminController,
    KeycloakAuthController,
    NRLsController,
    OrdersController,
    SamplesController,
    SystemInfoController,
    UsersController,
    VersionRootController,
    ZomoPlanFilesController
} from './model/controller.model';
import { AppServerConfiguration } from './model/server.model';
import { SERVER_TYPES } from './server.types';

export function getServerContainerModule(
    serverCongfiguration: AppServerConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, _unbind: interfaces.Unbind) => {
            bind(SERVER_TYPES.AppServerConfiguration).toConstantValue(
                serverCongfiguration
            );

            bind<SystemInfoController>(SERVER_TYPES.InfoController).to(
                DefaultSystemInfoController
            );
            bind<InstitutesController>(SERVER_TYPES.InstitutesController).to(
                DefaultInstituteController
            );
            bind<UsersController>(SERVER_TYPES.UsersController).to(
                DefaultUsersController
            );
            bind<SamplesController>(SERVER_TYPES.SamplesController).to(
                DefaultSamplesController
            );
            bind<NRLsController>(SERVER_TYPES.NRLsController).to(
                DefaultNRLsController
            );
            bind<ClientDashboardController>(
                SERVER_TYPES.ClientDashboardController
            ).to(DefaultClientDashboardController);
            bind<ZomoPlanFilesController>(
                SERVER_TYPES.ZomoPlanFilesController
            ).to(DefaultZomoPlanFilesController);
            bind<OrdersController>(SERVER_TYPES.OrdersController).to(
                DefaultOrdersController
            );
            bind<VersionRootController>(SERVER_TYPES.VersionRootController).to(
                DefaultVersionRootController
            );
            bind<KeycloakAuthController>(
                SERVER_TYPES.KeycloakAuthController
            ).to(DefaultKeycloakAuthController);
            bind<KeycloakAdminController>(
                SERVER_TYPES.KeycloakAdminController
            ).to(DefaultKeycloakAdminController);
            bind<RequestHandler>(SERVER_TYPES.MulterMW).toConstantValue(
                uploadToMemory
            );
        }
    );
}
