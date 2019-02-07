export interface Institution {
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

class DefaultInstitute implements Institution {
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

export function createInstitution(id: string): Institution {
    return new DefaultInstitute(id);
}
