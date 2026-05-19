import { inject, injectable } from 'inversify';
import {
    Actor,
    ActorContextService,
    ActorRepository
} from '../model/actor.model';
import { APPLICATION_TYPES } from '../../application.types';

@injectable()
export class DefaultActorContextService implements ActorContextService {
    constructor(
        @inject(APPLICATION_TYPES.ParseActorRepository)
        private readonly repo: ActorRepository
    ) {}

    private extractInstituteId(groups: string[]): string {
        const instituteGroups = groups.filter(g =>
            g.startsWith('/institutes/')
        );
        if (instituteGroups.length !== 1) {
            throw new Error(
                `Actor must belong to exactly one institute group, found ${instituteGroups.length}`
            );
        }
        return instituteGroups[0].replace('/institutes/', '');
    }

    async resolveActor(
        keycloakSub: string,
        email: string,
        displayName: string,
        groups: string[],
        cachedActor?: Actor
    ): Promise<Actor> {
        if (cachedActor) {
            return cachedActor;
        }
        const existing = await this.repo.findByKeycloakSub(keycloakSub);
        if (existing) {
            return existing;
        }
        const instituteId = this.extractInstituteId(groups);
        return this.repo.materialize({
            keycloakSub,
            instituteId,
            email,
            displayName
        });
    }
}
