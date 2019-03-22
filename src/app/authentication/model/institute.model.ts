export interface Institute {
    uniqueId: string;
    stateShort: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];
}

export interface InstitutePort {
    retrieveInstitutes(): Promise<Institute[]>;
}

export interface InstituteService extends InstitutePort {}
