import { ContainerModule, interfaces } from 'inversify';
import {
    ParseUserRepository,
    ParseInstituteRepository,
    ParseTokenRepository
} from '../../app/ports';

import { ParseDefaultUserRepository } from './repositories/parse/parse.user.repository';
import { ParseDefaultInstituteRepository } from './repositories/parse/parse.institute.repository';
import { ParseDefaultTokenRepository } from './repositories/parse/parse.token.repository';

import { APPLICATION_TYPES } from './../../app/application.types';

export function getPersistenceContainerModule(): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind<ParseUserRepository>(APPLICATION_TYPES.ParseUserRepository).to(
                ParseDefaultUserRepository
            );

            bind<ParseInstituteRepository>(
                APPLICATION_TYPES.ParseInstituteRepository
            ).to(ParseDefaultInstituteRepository);

            bind<ParseTokenRepository>(
                APPLICATION_TYPES.ParseTokenRepository
            ).to(ParseDefaultTokenRepository);
        }
    );
}
