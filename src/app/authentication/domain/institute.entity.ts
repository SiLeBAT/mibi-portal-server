import { Institute } from '../model/institute.model';

class DefaultInstitute implements Institute {
    uniqueId: string;
    stateShort: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];

    constructor(id: string) {
        this.uniqueId = id;
    }
}

export function createInstitution(id: string): Institute {
    return new DefaultInstitute(id);
}
