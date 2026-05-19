import { ActorRepository } from '../../../app/authentication/model/actor.model';

export function getMockActorRepository(): ActorRepository {
    return {
        findByKeycloakSub: jest.fn().mockResolvedValue(null),
        materialize: jest.fn()
    };
}
