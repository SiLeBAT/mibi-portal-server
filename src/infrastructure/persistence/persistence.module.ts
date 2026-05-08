import { ContainerModule, interfaces } from 'inversify';
import {
    ParseUserRepository,
    ParseInstituteRepository,
    ParseTokenRepository
} from '../../app/ports';
import { ActorRepository } from '../../app/authentication/model/actor.model';

import { ParseDefaultUserRepository } from './repositories/parse/parse.user.repository';
import { ParseDefaultInstituteRepository } from './repositories/parse/parse.institute.repository';
import { ParseDefaultTokenRepository } from './repositories/parse/parse.token.repository';
import { ParseDefaultActorRepository } from './repositories/parse/parse.actor.repository';

import { APPLICATION_TYPES } from './../../app/application.types';

export function getPersistenceContainerModule(): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, _unbind: interfaces.Unbind) => {
            bind<ParseUserRepository>(APPLICATION_TYPES.ParseUserRepository).to(
                ParseDefaultUserRepository
            );

            bind<ParseInstituteRepository>(
                APPLICATION_TYPES.ParseInstituteRepository
            ).to(ParseDefaultInstituteRepository);

            bind<ParseTokenRepository>(
                APPLICATION_TYPES.ParseTokenRepository
            ).to(ParseDefaultTokenRepository);

            bind<ActorRepository>(APPLICATION_TYPES.ParseActorRepository).to(
                ParseDefaultActorRepository
            );
        }
    );
}
