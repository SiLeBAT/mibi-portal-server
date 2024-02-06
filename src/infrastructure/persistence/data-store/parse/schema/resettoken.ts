import Parse from 'parse/node';
import { User, SCHEMA_FIELDS as USER_FIELDS } from './user';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'resettokens',
    token: 'token',
    type: 'type',
    user: 'user',
    oriCreatedAt: 'oriCreatedAt',
    oriUpdatedAt: 'oriUpdatedAt'
} as const;

async function createSchema(): Promise<boolean> {
    const tokenSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await tokenSchema.get();
        return true;
    } catch (error) {
        if (
            error.message.includes(
                `Class ${SCHEMA_FIELDS.className} does not exist`
            )
        ) {
            return tokenSchema
                .addField(SCHEMA_FIELDS.token, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.type, 'String', {
                    required: true
                })
                .addPointer(SCHEMA_FIELDS.user, USER_FIELDS.className, {
                    required: true
                })
                .addField(SCHEMA_FIELDS.oriCreatedAt, 'Date')
                .addField(SCHEMA_FIELDS.oriUpdatedAt, 'Date')
                .save()
                .then(
                    () => {
                        logger.info(`${SCHEMA_FIELDS.className} schema saved`);
                        return true;
                    },
                    error => {
                        logger.error(
                            `error saving ${SCHEMA_FIELDS.className} schema: `,
                            error
                        );
                        return false;
                    }
                );
        } else {
            logger.error(
                `error creating ${SCHEMA_FIELDS.className} schema: `,
                error
            );
            return false;
        }
    }
}

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

    getId(): string {
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

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, Token);
}
