export interface IInstitutionEntity {
    uniqueId: string;
    short: string;
    name1: string;
    name2: string;
    location: string;
    address1: IAddress;
    address2: IAddress;
    phone: string;
    fax: string;
    email: string[];
    stateId: string;
}

export interface IAddress {
    street: string;
    city: string;
}

class Institution implements IInstitutionEntity {
    uniqueId: string;
    short: string;
    name1: string;
    name2: string;
    location: string;
    address1: IAddress;
    address2: IAddress;
    phone: string;
    fax: string;
    email: string[];
    stateId: string;

    constructor(id: string) {
        this.uniqueId = id;

    }
}

export function createInstitution(id: string): IInstitutionEntity {
    return new Institution(id);
}
