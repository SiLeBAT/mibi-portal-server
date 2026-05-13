import { Actor } from './actor.model';

export interface RegisterActorCommand {
    email: string;
    firstName: string;
    lastName: string;
    instituteId: string;
    instituteName: string;
}

export interface KeycloakActorsPort {
    registerPendingActor(cmd: RegisterActorCommand): Promise<Actor>;
    activateActor(sub: string): Promise<void>;
    enableActor(sub: string): Promise<void>;
    disableActor(sub: string): Promise<void>;
    listPendingActors(): Promise<Actor[]>;
    findActorBySub(sub: string): Promise<Actor | null>;
    listMibiAdmins(): Promise<Actor[]>;
}

export interface AdminUserRepresentation {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export interface GroupRepresentation {
    id: string;
    name: string;
    path: string;
}

/** Minimal shape of the Keycloak Admin SDK operations used by KeycloakActors. */
export interface AdminClientPort {
    users: {
        create(payload: {
            realm: string;
            enabled: boolean;
            email: string;
            firstName: string;
            lastName: string;
            username: string;
        }): Promise<{ id: string }>;
        update(
            query: { id: string; realm: string },
            payload: { enabled: boolean }
        ): Promise<void>;
        addToGroup(query: {
            id: string;
            groupId: string;
            realm: string;
        }): Promise<void>;
        executeActionsEmail(query: {
            id: string;
            realm: string;
            redirectUri?: string;
            actions?: string[];
        }): Promise<void>;
        find(query: {
            realm: string;
            enabled?: boolean;
        }): Promise<AdminUserRepresentation[]>;
    };
    groups: {
        find(query: {
            realm: string;
            search?: string;
        }): Promise<GroupRepresentation[]>;
        create(payload: {
            realm: string;
            name: string;
            path?: string;
        }): Promise<{ id: string }>;
    };
    roles: {
        findUsersWithRole(query: {
            roleName: string;
            realm: string;
        }): Promise<AdminUserRepresentation[]>;
    };
}
