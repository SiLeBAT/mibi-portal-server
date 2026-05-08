import { ContainerModule, interfaces } from 'inversify';
import { APPLICATION_TYPES } from '../../../application.types';
import { KeycloakOidcPort } from '../../model/oidc.model';
import { getMockKeycloakOidcService } from './keycloak-oidc.service';

export const mockKeycloakOidcModule = new ContainerModule(
    (bind: interfaces.Bind) => {
        bind<KeycloakOidcPort>(
            APPLICATION_TYPES.KeycloakOidcService
        ).toConstantValue(getMockKeycloakOidcService());
    }
);
