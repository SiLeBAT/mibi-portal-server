import { Actor } from '../../model/actor.model';
import {
    PendingActorSummary,
    RegisterActorCommand
} from '../../model/keycloak-actors.model';

const ADMIN: Actor = {
    keycloakSub: 'admin-sub',
    instituteId: '',
    email: 'admin@bfr.de',
    displayName: 'Admin User'
};

export function getMockKeycloakActorsService() {
    return {
        activateActor: jest.fn(
            (_sub: string): Promise<void> => Promise.resolve()
        ),
        registerPendingActor: jest.fn(
            (_cmd: RegisterActorCommand): Promise<Actor> =>
                Promise.resolve({
                    keycloakSub: 'new-sub',
                    instituteId: _cmd.instituteId,
                    email: _cmd.email,
                    displayName: `${_cmd.firstName} ${_cmd.lastName}`
                })
        ),
        enableActor: jest.fn(
            (_sub: string): Promise<void> => Promise.resolve()
        ),
        disableActor: jest.fn(
            (_sub: string): Promise<void> => Promise.resolve()
        ),
        listPendingActors: jest.fn((): Promise<Actor[]> => Promise.resolve([])),
        listPendingActorSummaries: jest.fn(
            (): Promise<PendingActorSummary[]> => Promise.resolve([])
        ),
        findActorBySub: jest.fn(
            (_sub: string): Promise<Actor | null> => Promise.resolve(null)
        ),
        listMibiAdmins: jest.fn(
            (): Promise<Actor[]> => Promise.resolve([ADMIN])
        )
    };
}
