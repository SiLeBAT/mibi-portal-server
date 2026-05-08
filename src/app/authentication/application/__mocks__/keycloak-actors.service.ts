import { Actor } from '../../model/actor.model';
import { RegisterActorCommand } from '../../model/keycloak-actors.model';

const ADMIN: Actor = {
    sub: 'admin-sub',
    instituteId: '',
    email: 'admin@bfr.de',
    displayName: 'Admin User'
};

export function getMockKeycloakActorsService() {
    return {
        registerPendingActor: jest.fn(
            (_cmd: RegisterActorCommand): Promise<Actor> =>
                Promise.resolve({
                    sub: 'new-sub',
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
        findActorBySub: jest.fn(
            (_sub: string): Promise<Actor | null> => Promise.resolve(null)
        ),
        listMibiAdmins: jest.fn(
            (): Promise<Actor[]> => Promise.resolve([ADMIN])
        )
    };
}
