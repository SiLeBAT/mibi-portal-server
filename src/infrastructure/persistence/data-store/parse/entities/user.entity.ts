import * as Parse from 'parse/node';
import { Institution } from './institution.entity';

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
    oriUpdatedAt: 'oriUpdatedAt',
    sub: 'sub',
    instituteId: 'instituteId'
} as const;

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
    sub?: string;
    instituteId?: string;
}

export class User extends Parse.Object<IUser> {
    constructor(attributes: IUser) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string | undefined {
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

    getSub(): string | undefined {
        return this.get(SCHEMA_FIELDS.sub);
    }

    getInstituteId(): string | undefined {
        return this.get(SCHEMA_FIELDS.instituteId);
    }
}

export function registerParseClass() {
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, User);
}
