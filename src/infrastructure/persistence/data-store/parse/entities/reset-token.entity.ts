import * as Parse from 'parse/node';
import { User } from './user.entity';

export const SCHEMA_FIELDS = {
    className: 'resettokens',
    token: 'token',
    type: 'type',
    user: 'user',
    oriCreatedAt: 'oriCreatedAt',
    oriUpdatedAt: 'oriUpdatedAt'
} as const;

interface IToken extends Parse.Attributes {
    token: string;
    type: string;
    user?: User;
    oriCreatedAt?: Date;
    oriUpdatedAt?: Date;
}

export class Token extends Parse.Object<IToken> {
    constructor(attributes: IToken) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string | undefined {
        return this.id;
    }

    setToken(token: string) {
        this.set(SCHEMA_FIELDS.token, token);
    }

    getToken(): string {
        return this.get(SCHEMA_FIELDS.token);
    }

    setType(type: string) {
        this.set(SCHEMA_FIELDS.type, type);
    }

    getType(): string {
        return this.get(SCHEMA_FIELDS.type);
    }

    setUser(user: User) {
        this.set(SCHEMA_FIELDS.user, user);
    }

    getUser(): User | undefined {
        return this.get(SCHEMA_FIELDS.user);
    }

    setOriCreatedAt(oriCreatedAt: Date) {
        this.set(SCHEMA_FIELDS.oriCreatedAt, oriCreatedAt);
    }

    getOriCreatedAt() {
        return this.get(SCHEMA_FIELDS.oriCreatedAt);
    }

    setOriUpdatedAt(oriUpdatedAt: Date) {
        this.set(SCHEMA_FIELDS.oriUpdatedAt, oriUpdatedAt);
    }

    getOriUpdatedAt() {
        return this.get(SCHEMA_FIELDS.oriUpdatedAt);
    }
}

export function registerParseClass() {
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, Token);
}
