import argon2 from 'argon2';
import { User, UserCredentials } from '../model/user.model';
import { Institute } from '../model/institute.model';

const defaultHashOptions = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 2048,
    parallelism: 4,
    type: argon2.argon2id
};

class GenericUser implements User {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: Institute;

    static create(
        id: string,
        email: string,
        fname: string,
        lname: string,
        inst: Institute,
        password: string,
        enabled: boolean = false,
        adminEnabled: boolean = false,
        numAttempt: number = 0,
        lastAttempt: number = Date.now()
    ): User {
        return new GenericUser(
            id,
            email,
            fname,
            lname,
            inst,
            password,
            enabled,
            adminEnabled,
            numAttempt,
            lastAttempt
        );
    }
    constructor(
        id: string,
        email: string,
        fname: string,
        lname: string,
        inst: Institute,
        private _password: string,
        private enabled: boolean,
        private adminEnabled: boolean,
        private numAttempt: number,
        private lastAttempt: number
    ) {
        this.uniqueId = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
        this.institution = inst;
    }

    get password(): string {
        return this._password;
    }

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }

    isVerified(verified?: boolean) {
        if (!(verified === undefined)) {
            this.enabled = !!verified;
        }
        return this.enabled;
    }

    isActivated(active?: boolean) {
        if (!(active === undefined)) {
            this.adminEnabled = !!active;
        }
        return this.adminEnabled;
    }

    async isAuthorized(credentials: UserCredentials): Promise<boolean> {
        return this.verifyPassword(this._password, credentials.password);
    }

    async updatePassword(password: string): Promise<string> {
        return this.hashPassword(password).then(
            hashed => (this._password = hashed)
        );
    }

    updateNumberOfFailedAttempts(increment: boolean) {
        increment ? this.numAttempt++ : (this.numAttempt = 0);
    }

    updateLastLoginAttempt() {
        this.lastAttempt = Date.now();
    }

    getNumberOfFailedAttempts(): number {
        return this.numAttempt;
    }

    getLastLoginAttempt(): number {
        return this.lastAttempt;
    }

    private async verifyPassword(
        hashedPassword: string,
        password: string
    ): Promise<boolean> {
        return argon2.verify(hashedPassword, password);
    }

    private async hashPassword(
        password: string,
        options = defaultHashOptions
    ): Promise<string> {
        return argon2.hash(password, options);
    }
}

export function createUser(
    id: string,
    email: string,
    fname: string,
    lname: string,
    inst: Institute,
    password: string,
    enabled: boolean = false,
    adminEnabled: boolean = false,
    numAttempt: number = 0,
    lastAttempt: number = Date.now()
): User {
    return GenericUser.create(
        id,
        email,
        fname,
        lname,
        inst,
        password,
        enabled,
        adminEnabled,
        numAttempt,
        lastAttempt
    );
}
