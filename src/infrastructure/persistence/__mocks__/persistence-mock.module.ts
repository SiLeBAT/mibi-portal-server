import { ContainerModule, interfaces } from 'inversify';
import {
    ParseInstituteRepository,
    ParseUserRepository,
    ParseTokenRepository,
    ActorRepository
} from '../../../app/ports';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { getMockActorRepository } from './actor.repository';
import { getMockInstituteRepository } from './institute.repository';
import { getMockTokenRepository } from './token.repository';
import { getMockUserRepository } from './user.repository';

export const mockPersistenceContainerModule = new ContainerModule(
    (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        bind<ParseInstituteRepository>(
            APPLICATION_TYPES.ParseInstituteRepository
        ).toConstantValue(getMockInstituteRepository());

        bind<ParseUserRepository>(
            APPLICATION_TYPES.ParseUserRepository
        ).toConstantValue(getMockUserRepository());

        bind<ParseTokenRepository>(
            APPLICATION_TYPES.ParseTokenRepository
        ).toConstantValue(getMockTokenRepository());

        bind<ActorRepository>(
            APPLICATION_TYPES.ParseActorRepository
        ).toConstantValue(getMockActorRepository());
    }
);
