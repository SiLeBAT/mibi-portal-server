export interface Actor {
    keycloakSub: string;
    instituteId: string;
    email: string;
    displayName: string;
}

export interface ActorRepository {
    findByKeycloakSub(keycloakSub: string): Promise<Actor | null>;
    materialize(actor: Actor): Promise<Actor>;
}

export interface ActorContextService {
    resolveActor(
        keycloakSub: string,
        email: string,
        displayName: string,
        groups: string[],
        cachedActor?: Actor
    ): Promise<Actor>;
}
