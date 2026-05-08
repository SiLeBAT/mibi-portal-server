import { injectable } from 'inversify';
import {
    Actor,
    ActorRepository
} from '../../../../app/authentication/model/actor.model';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import {
    User as ParseUser,
    SCHEMA_FIELDS as USER_FIELDS
} from '../../data-store/parse/schema/user';

@injectable()
export class ParseDefaultActorRepository
    extends ParseRepositoryBase<ParseUser>
    implements ActorRepository
{
    constructor() {
        super();
        super.setClassName(USER_FIELDS.className);
    }

    async findBySub(sub: string): Promise<Actor | null> {
        const user = await this._findOne(USER_FIELDS.sub, sub);
        if (!user) return null;
        return this.toActor(user);
    }

    async materialize(actor: Actor): Promise<Actor> {
        const parseUser = new ParseUser({
            sub: actor.sub,
            instituteId: actor.instituteId,
            email: actor.email,
            firstName: actor.displayName,
            lastName: '',
            password: '',
            enabled: true,
            adminEnabled: false,
            numAttempt: 0,
            lastAttempt: Date.now()
        });
        const saved = await this._create(parseUser);
        return this.toActor(saved);
    }

    private toActor(user: ParseUser): Actor {
        return {
            sub: user.getSub() ?? '',
            instituteId: user.getInstituteId() ?? '',
            email: user.getEmail(),
            displayName: user.getFirstName()
        };
    }
}
