import { isUndefined } from 'util';
import * as argon2 from 'argon2';
import { IInstitution } from './institution.entity';

const defaultHashOptions = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 15,
    parallelism: 100,
    type: argon2.argon2id
};

export interface IUserCredentials {
    email: string;
    password: string;
}

export interface IUserBase {
    firstName: string;
    lastName: string;
    email: string;
    institution: IInstitution;
}

export interface IUser extends IUserBase {
    uniqueId: string;
    readonly password: string;
    isAuthorized(credentials: IUserCredentials): Promise<boolean>;
    updatePassword(password: string): Promise<string>;
    isActivated(active?: boolean): boolean;
    isAdminActivated(active?: boolean): boolean;
}

class GenericUser implements IUser {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: IInstitution;

    constructor(id: string, email: string, fname: string, lname: string, inst: IInstitution, private _password: string, private enabled: boolean, private adminEnabled: boolean) {
        this.uniqueId = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
        this.institution = inst;
    }

    get password(): string {
        return this._password;
    }

    isActivated(active?: boolean) {
        if (!isUndefined(active)) {
            this.enabled = !!active;
        }
        return this.enabled;
    }

    isAdminActivated(active?: boolean) {
        if (!isUndefined(active)) {
            this.adminEnabled = !!active;
        }
        return this.adminEnabled;
    }

    isAuthorized(credentials: IUserCredentials): Promise<boolean> {
        return this.verifyPassword(this._password, credentials.password);
    }

    updatePassword(password: string): Promise<string> {
        return this.hashPassword(password).then(
            hashed => this._password = hashed
        );
    }

    private verifyPassword(hashedPassword: string, password: string) {
        return argon2.verify(hashedPassword, password);
    }

    private hashPassword(password: string, options = defaultHashOptions) {
        return argon2.hash(password, options);
    }
}

export function createUser(id: string, email: string, fname: string, lname: string, inst: IInstitution, password: string, enabled: boolean = false, adminEnabled: boolean = false): IUser {
    return new GenericUser(id, email, fname, lname, inst, password, enabled, adminEnabled);
}
