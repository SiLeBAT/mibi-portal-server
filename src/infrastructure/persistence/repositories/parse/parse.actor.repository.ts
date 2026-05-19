import { randomBytes } from 'crypto';
import { injectable } from 'inversify';
import * as Parse from 'parse/node';
import {
    Actor,
    ActorRepository
} from '../../../../app/authentication/model/actor.model';
import { logger } from '../../../../aspects';

@injectable()
export class ParseDefaultActorRepository implements ActorRepository {
    async findByKeycloakSub(keycloakSub: string): Promise<Actor | null> {
        const user = await new Parse.Query(Parse.User)
            .equalTo('keycloakSub', keycloakSub)
            .first({ useMasterKey: true });
        return user ? toActor(user) : null;
    }

    async materialize(actor: Actor): Promise<Actor> {
        // Some _User rows pre-date the Keycloak migration (legacy JWT signup,
        // or a previous materialize() that lost keycloakSub before fix
        // c4285f2). Adopt those rows in place instead of colliding on username.
        const existing = await new Parse.Query(Parse.User)
            .equalTo('username', actor.email)
            .first({ useMasterKey: true });

        const saved = existing
            ? await linkExisting(existing, actor)
            : await createFresh(actor);

        await ensureUserInfo(saved, actor);

        return toActor(saved);
    }
}

async function linkExisting(
    user: Parse.User,
    actor: Actor
): Promise<Parse.User> {
    const existingSub = user.get('keycloakSub') as string | undefined;
    if (existingSub && existingSub !== actor.keycloakSub) {
        // Dev realms get reimported and lab-tester's UUID rotates; in prod a
        // mismatch is a real identity conflict we refuse to silently rewrite.
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                `Username ${actor.email} is already linked to a different keycloakSub`
            );
        }
        logger.warn(
            `Rewriting stale keycloakSub for ${actor.email} (was ${existingSub}, now ${actor.keycloakSub}) — dev-only behavior`
        );
    }
    user.set('keycloakSub', actor.keycloakSub);
    user.set('instituteId', actor.instituteId);
    user.set('firstName', actor.displayName);
    return user.save(null, { useMasterKey: true });
}

async function createFresh(actor: Actor): Promise<Parse.User> {
    const user = new Parse.User();
    user.set('username', actor.email);
    user.set('email', actor.email);
    // Keycloak owns credentials; Parse still requires a password column.
    user.set('password', randomBytes(32).toString('hex'));
    user.set('firstName', actor.displayName);
    user.set('lastName', '');
    user.set('keycloakSub', actor.keycloakSub);
    user.set('instituteId', actor.instituteId);
    return user.save(null, { useMasterKey: true });
}

async function ensureUserInfo(user: Parse.User, actor: Actor): Promise<void> {
    const existing = await new Parse.Query('User_Info')
        .equalTo('user', user)
        .first({ useMasterKey: true });
    if (existing) {
        return;
    }
    const InstitutePointer = Parse.Object.extend('institutions');
    const institute = InstitutePointer.createWithoutData(actor.instituteId);
    const userInfo = new Parse.Object('User_Info');
    userInfo.set('user', user);
    userInfo.set('institute', institute);
    userInfo.set('firstName', actor.displayName);
    userInfo.set('lastName', '');
    await userInfo.save(null, { useMasterKey: true });
}

function toActor(user: Parse.User): Actor {
    return {
        keycloakSub: user.get('keycloakSub') ?? '',
        instituteId: user.get('instituteId') ?? '',
        email: user.get('email') ?? '',
        displayName: user.get('firstName') ?? ''
    };
}
