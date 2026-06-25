import {
    ParseInstituteRepository,
    ParseTokenRepository,
    ParseUserRepository
} from '../../app/ports';
import { ActorRepository } from '../../app/authentication/model/actor.model';
import { UserConsentRepository } from '../../app/authentication/model/consent.model';
import { ParseDefaultActorRepository } from './repositories/parse/parse.actor.repository';
import { ParseDefaultInstituteRepository } from './repositories/parse/parse.institute.repository';
import { ParseDefaultTokenRepository } from './repositories/parse/parse.token.repository';
import { ParseDefaultUserConsentRepository } from './repositories/parse/parse.user-consent.repository';
import { ParseDefaultUserRepository } from './repositories/parse/parse.user.repository';

export interface PersistenceRepositories {
    userRepository: ParseUserRepository;
    instituteRepository: ParseInstituteRepository;
    tokenRepository: ParseTokenRepository;
    actorRepository: ActorRepository;
    userConsentRepository: UserConsentRepository;
}

export function createPersistenceRepositories(): PersistenceRepositories {
    return {
        userRepository: new ParseDefaultUserRepository(),
        instituteRepository: new ParseDefaultInstituteRepository(),
        tokenRepository: new ParseDefaultTokenRepository(),
        actorRepository: new ParseDefaultActorRepository(),
        userConsentRepository: new ParseDefaultUserConsentRepository()
    };
}
