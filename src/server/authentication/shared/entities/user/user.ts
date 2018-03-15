import { isUndefined } from 'util';
import * as argon2 from 'argon2';
import { IInstitutionEntity } from './../institution';

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
    institution: IInstitutionEntity;
}

export interface IUserEntity extends IUserBase {
    uniqueId: string;
    readonly password: string;
    isAuthorized(credentials: IUserCredentials): Promise<boolean>;
    updatePassword(password: string): Promise<string>;
    isActivated(active?: boolean): boolean;
}

class GenericUser implements IUserEntity {
    uniqueId: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: IInstitutionEntity;

    constructor(id: string, email: string, fname: string, lname: string, inst: IInstitutionEntity, private _password: string, private enabled: boolean) {
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

export function createUser(id: string, email: string, fname: string, lname: string, inst: IInstitutionEntity, password: string, enabled: boolean = false): IUserEntity {
    return new GenericUser(id, email, fname, lname, inst, password, enabled);
}
