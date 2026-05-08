export interface Actor {
    sub: string;
    instituteId: string;
    email: string;
    displayName: string;
}

export interface ActorRepository {
    findBySub(sub: string): Promise<Actor | null>;
    materialize(actor: Actor): Promise<Actor>;
}

export interface ActorContextService {
    resolveActor(
        sub: string,
        email: string,
        displayName: string,
        groups: string[],
        cachedActor?: Actor
    ): Promise<Actor>;
}
