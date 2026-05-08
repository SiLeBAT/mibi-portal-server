import { ActorRepository } from '../../../app/authentication/model/actor.model';

export function getMockActorRepository(): ActorRepository {
    return {
        findBySub: jest.fn().mockResolvedValue(null),
        materialize: jest.fn()
    };
}
