import { isUndefined } from 'util';
import { IInstitutionEntity } from './../institution';

export interface IUserdata {
    uniqueId: string;
    department: string;
    contact: string;
    phone: string;
    email: string;
}

export interface IUserBase {
    firstName: string;
    lastName: string;
    email: string;
    institution: IInstitutionEntity;
    userdata: IUserdata[];
    password: string;
}
export interface IUserEntity extends IUserBase {
    uniqueId: string ;
    isActivated(active?: boolean): boolean;
}

class User implements IUserEntity {
    uniqueId: string ;
    firstName: string;
    lastName: string;
    email: string;
    institution: IInstitutionEntity;
    userdata: IUserdata[];
    password: string;

    constructor(id: string , email: string, fname: string, lname: string, inst: IInstitutionEntity, private enabled: boolean) {
        this.uniqueId = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
        this.institution = inst;
    }

    isActivated(active?: boolean) {
        if (!isUndefined(active)) {
            this.enabled = !!active;
        }
        return this.enabled;
    }
}

export function createUser(id: string , email: string, fname: string, lname: string, inst: IInstitutionEntity, enabled: boolean = false): IUserEntity {
    return new User(id, email, fname, lname, inst, enabled);
}
