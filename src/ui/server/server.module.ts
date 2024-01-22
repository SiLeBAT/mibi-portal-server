import { RequestHandler } from 'express';
import { ContainerModule, interfaces } from 'inversify';
import { DefaultSystemInfoController } from './controllers/info.controller';
import { DefaultNRLsController } from './controllers/nrls.controller';
import { DefaultSamplesController } from './controllers/samples.controller';
import { DefaultTokensController } from './controllers/tokens.controller';
import { DefaultUsersController } from './controllers/users.controller';
import { DefaultVersionRootController } from './controllers/version-root.controller';
import { uploadToMemory } from './middleware/file-upload.middleware';
import {
    NRLsController,
    SamplesController,
    SystemInfoController,
    TokensController,
    UsersController,
    VersionRootController
} from './model/controller.model';
import { AppServerConfiguration } from './model/server.model';
import { SERVER_TYPES } from './server.types';

export function getServerContainerModule(
    serverCongfiguration: AppServerConfiguration
): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(SERVER_TYPES.AppServerConfiguration).toConstantValue(
                serverCongfiguration
            );

            bind<SystemInfoController>(SERVER_TYPES.InfoController).to(
                DefaultSystemInfoController
            );
            bind<UsersController>(SERVER_TYPES.UsersController).to(
                DefaultUsersController
            );
            bind<SamplesController>(SERVER_TYPES.SamplesController).to(
                DefaultSamplesController
            );
            bind<TokensController>(SERVER_TYPES.TokensController).to(
                DefaultTokensController
            );
            bind<NRLsController>(SERVER_TYPES.NRLsController).to(
                DefaultNRLsController
            );
            bind<VersionRootController>(SERVER_TYPES.VersionRootController).to(
                DefaultVersionRootController
            );
            bind<RequestHandler>(SERVER_TYPES.MulterMW).toConstantValue(
                uploadToMemory
            );
        }
    );
}
