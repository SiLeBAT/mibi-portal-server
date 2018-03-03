export interface IUser {
    // Should _id be exposed?
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActivated(): boolean;
}

export interface IUserExtended extends IUser {
    institution: string;
    userdata: any[];
}


class User implements IUserExtended {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    institution: string;
    userdata: any[];

    constructor(id, email, fname, lname, inst, private enabled) {
        this._id = id;
        this.email = email;
        this.firstName = fname;
        this.lastName = lname;
        this.institution = inst;
    }

    isActivated() {
        return this.enabled;
    }
}

export function createUser(id, email, fname, lname, inst, enabled = false): IUserExtended {
    return new User(id, email, fname, lname, inst, enabled);
}