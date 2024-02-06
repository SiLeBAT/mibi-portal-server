import Parse from 'parse/node';
import {
    Institution,
    SCHEMA_FIELDS as INSTITUTION_FIELDS
} from './institution';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'users',
    password: 'password',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    enabled: 'enabled',
    adminEnabled: 'adminEnabled',
    numAttempt: 'numAttempt',
    lastAttempt: 'lastAttempt',
    institution: 'institution',
    oriCreatedAt: 'oriCreatedAt',
    oriUpdatedAt: 'oriUpdatedAt'
} as const;

async function createSchema(): Promise<boolean> {
    const userSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await userSchema.get();
        return true;
    } catch (error) {
        if (
            error.message.includes(
                `Class ${SCHEMA_FIELDS.className} does not exist`
            )
        ) {
            return userSchema
                .addField(SCHEMA_FIELDS.firstName, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.lastName, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.email, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.password, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.enabled, 'Boolean', {
                    required: true,
                    defaultValue: false
                })
                .addField(SCHEMA_FIELDS.adminEnabled, 'Boolean', {
                    required: true,
                    defaultValue: false
                })
                .addField(SCHEMA_FIELDS.numAttempt, 'Number', {
                    required: true,
                    defaultValue: 0
                })
                .addField(SCHEMA_FIELDS.lastAttempt, 'Number', {
                    required: true,
                    defaultValue: Date.now()
                })
                .addPointer(
                    SCHEMA_FIELDS.institution,
                    INSTITUTION_FIELDS.className
                )
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

export interface IUser extends Parse.Attributes {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    enabled?: boolean;
    adminEnabled?: boolean;
    numAttempt?: number;
    lastAttempt?: number;
    institution?: Institution;
    oriCreatedAt?: Date;
    oriUpdatedAt?: Date;
}

export class User extends Parse.Object<IUser> {
    constructor(attributes: IUser) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string {
        return this.id;
    }

    setFirstName(firstName: string) {
        this.set(SCHEMA_FIELDS.firstName, firstName);
    }

    getFirstName(): string {
        return this.get(SCHEMA_FIELDS.firstName);
    }

    setLastName(lastName: string) {
        this.set(SCHEMA_FIELDS.lastName, lastName);
    }

    getLastName(): string {
        return this.get(SCHEMA_FIELDS.lastName);
    }

    setEmail(email: string) {
        this.set(SCHEMA_FIELDS.email, email);
    }

    getEmail(): string {
        return this.get(SCHEMA_FIELDS.email);
    }

    setPassword(password: string) {
        this.set(SCHEMA_FIELDS.password, password);
    }

    getPassword(): string {
        return this.get(SCHEMA_FIELDS.password);
    }

    setEnabled(enabled: boolean) {
        this.set(SCHEMA_FIELDS.enabled, enabled);
    }

    isEnabled(): boolean | undefined {
        return this.get(SCHEMA_FIELDS.enabled);
    }

    setAdminEnabled(adminEnabled: boolean) {
        this.set(SCHEMA_FIELDS.adminEnabled, adminEnabled);
    }

    isAdminEnabled(): boolean | undefined {
        return this.get(SCHEMA_FIELDS.adminEnabled);
    }

    setNumAttempt(numAttempt: number) {
        this.set(SCHEMA_FIELDS.numAttempt, numAttempt);
    }

    getNumAttempt(): number | undefined {
        return this.get(SCHEMA_FIELDS.numAttempt);
    }

    setLastAttempt(lastAttempt: number) {
        this.set(SCHEMA_FIELDS.lastAttempt, lastAttempt);
    }

    getLastAttempt(): number | undefined {
        return this.get(SCHEMA_FIELDS.lastAttempt);
    }

    setInstitution(institution: Institution) {
        this.set(SCHEMA_FIELDS.institution, institution);
    }

    getInstitution(): Institution | undefined {
        return this.get(SCHEMA_FIELDS.institution);
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
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, User);
}
