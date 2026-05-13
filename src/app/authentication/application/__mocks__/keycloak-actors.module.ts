import { ContainerModule, interfaces } from 'inversify';
import { APPLICATION_TYPES } from '../../../application.types';
import { KeycloakActorsPort } from '../../model/keycloak-actors.model';
import { getMockKeycloakActorsService } from './keycloak-actors.service';

export const mockKeycloakActorsModule = new ContainerModule(
    (bind: interfaces.Bind) => {
        bind<KeycloakActorsPort>(
            APPLICATION_TYPES.KeycloakActorsService
        ).toConstantValue(getMockKeycloakActorsService());
    }
);
