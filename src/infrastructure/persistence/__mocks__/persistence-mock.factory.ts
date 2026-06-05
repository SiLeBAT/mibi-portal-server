import { PersistenceRepositories } from '../persistence.factory';
import { getMockActorRepository } from './actor.repository';
import { getMockInstituteRepository } from './institute.repository';
import { getMockTokenRepository } from './token.repository';
import { getMockUserRepository } from './user.repository';

export function createMockPersistenceRepositories(): PersistenceRepositories {
    return {
        userRepository: getMockUserRepository(),
        instituteRepository: getMockInstituteRepository(),
        tokenRepository: getMockTokenRepository(),
        actorRepository: getMockActorRepository()
    };
}
