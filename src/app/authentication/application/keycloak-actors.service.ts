import { injectable } from 'inversify';
import { Actor } from '../model/actor.model';
import {
    AdminClientPort,
    AdminUserRepresentation,
    KeycloakActorsPort,
    PendingActorSummary,
    RegisterActorCommand
} from '../model/keycloak-actors.model';
import { UserAlreadyExistsError } from '../domain/domain.error';

const MIBI_ADMIN_ROLE = 'mibi-admin';
const INSTITUTES_PATH_PREFIX = '/institutes/';

@injectable()
export class DefaultKeycloakActorsService implements KeycloakActorsPort {
    constructor(
        private readonly client: AdminClientPort,
        private readonly realm: string
    ) {}

    async registerPendingActor(cmd: RegisterActorCommand): Promise<Actor> {
        let userId: string;
        try {
            const result = await this.client.users.create({
                realm: this.realm,
                enabled: false,
                email: cmd.email,
                firstName: cmd.firstName,
                lastName: cmd.lastName,
                username: cmd.email
            });
            userId = result.id;
        } catch (err: unknown) {
            if (isHttpConflict(err)) {
                throw new UserAlreadyExistsError(
                    `User already exists: ${cmd.email}`
                );
            }
            throw err;
        }

        const groupId = await this.ensureInstituteGroup(cmd.instituteId);
        await this.client.users.addToGroup({
            id: userId,
            groupId,
            realm: this.realm
        });

        await this.notifyAdmins();

        return {
            sub: userId,
            instituteId: cmd.instituteId,
            email: cmd.email,
            displayName: `${cmd.firstName} ${cmd.lastName}`
        };
    }

    async activateActor(sub: string): Promise<void> {
        await this.client.users.update(
            { id: sub, realm: this.realm },
            { enabled: true }
        );
        await this.client.users.executeActionsEmail({
            id: sub,
            realm: this.realm,
            actions: ['VERIFY_EMAIL', 'UPDATE_PASSWORD']
        });
    }

    async enableActor(sub: string): Promise<void> {
        await this.client.users.update(
            { id: sub, realm: this.realm },
            { enabled: true }
        );
    }

    async disableActor(sub: string): Promise<void> {
        await this.client.users.update(
            { id: sub, realm: this.realm },
            { enabled: false }
        );
    }

    async listPendingActors(): Promise<Actor[]> {
        const users = await this.client.users.find({
            realm: this.realm,
            enabled: false
        });
        return users.map(toActor);
    }

    async listPendingActorSummaries(): Promise<PendingActorSummary[]> {
        const users = await this.client.users.find({
            realm: this.realm,
            enabled: false
        });
        return users.map(toPendingActorSummary);
    }

    async findActorBySub(sub: string): Promise<Actor | null> {
        const users = await this.client.users.find({ realm: this.realm });
        const user = users.find(u => u.id === sub);
        return user ? toActor(user) : null;
    }

    async listMibiAdmins(): Promise<Actor[]> {
        const users = await this.client.roles.findUsersWithRole({
            roleName: MIBI_ADMIN_ROLE,
            realm: this.realm
        });
        return users.map(toActor);
    }

    private async ensureInstituteGroup(instituteId: string): Promise<string> {
        const groups = await this.client.groups.find({
            realm: this.realm,
            search: instituteId
        });
        const existing = groups.find(
            g => g.path === `${INSTITUTES_PATH_PREFIX}${instituteId}`
        );
        if (existing) {
            return existing.id;
        }
        const created = await this.client.groups.create({
            realm: this.realm,
            name: instituteId,
            path: `${INSTITUTES_PATH_PREFIX}${instituteId}`
        });
        return created.id;
    }

    private async notifyAdmins(): Promise<void> {
        const admins = await this.client.roles.findUsersWithRole({
            roleName: MIBI_ADMIN_ROLE,
            realm: this.realm
        });
        await Promise.all(
            admins.map(admin =>
                this.client.users.executeActionsEmail({
                    id: admin.id,
                    realm: this.realm,
                    actions: []
                })
            )
        );
    }
}

function toActor(user: AdminUserRepresentation): Actor {
    return {
        sub: user.id,
        instituteId: '',
        email: user.email ?? '',
        displayName: [user.firstName, user.lastName].filter(Boolean).join(' ')
    };
}

function toPendingActorSummary(
    user: AdminUserRepresentation
): PendingActorSummary {
    return {
        ...toActor(user),
        registeredAt: new Date(user.createdTimestamp ?? 0)
    };
}

function isHttpConflict(err: unknown): boolean {
    return (
        err instanceof Object &&
        'response' in err &&
        (err as { response: { status: number } }).response.status === 409
    );
}
