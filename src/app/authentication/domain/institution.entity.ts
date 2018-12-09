export interface Institution {
    uniqueId: string;
    stateShort: string;
    name1: string;
    name2: string;
    location: string;
    address1: Address;
    address2: Address;
    phone: string;
    fax: string;
    email: string[];
}

export interface Address {
    street: string;
    city: string;
}

class DefalultInstitution implements Institution {
    uniqueId: string;
    stateShort: string;
    name1: string;
    name2: string;
    location: string;
    address1: Address;
    address2: Address;
    phone: string;
    fax: string;
    email: string[];

    constructor(id: string) {
        this.uniqueId = id;

    }
}

export function createInstitution(id: string): Institution {
    return new DefalultInstitution(id);
}
