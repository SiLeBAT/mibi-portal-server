export interface IInstitution {
    short: string;
    name1: string;
    name2: string;
    location: string;
    address1: IAddress;
    address2: IAddress;
    phone: string;
    fax: string;
    email: string[];
    state_id: string;
    created: Date;
    updated: Date;
}

interface IAddress {
    street: string;
    city: string;
}