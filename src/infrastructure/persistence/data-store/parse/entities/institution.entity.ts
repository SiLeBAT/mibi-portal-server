import * as Parse from 'parse/node';

export const SCHEMA_FIELDS = {
    className: 'institutions',
    state_short: 'state_short',
    name1: 'name1',
    name2: 'name2',
    zip: 'zip',
    city: 'city',
    phone: 'phone',
    fax: 'fax',
    email: 'email'
} as const;

export interface IInstitution extends Parse.Attributes {
    state_short: string;
    name1: string;
    name2?: string;
    zip?: string;
    city?: string;
    phone: string;
    fax?: string;
    email?: string[];
}
export class Institution extends Parse.Object<IInstitution> {
    constructor(attributes: IInstitution) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string | undefined {
        return this.id;
    }

    setStateShort(stateShort: string) {
        this.set(SCHEMA_FIELDS.state_short, stateShort);
    }

    getStateShort(): string {
        return this.get(SCHEMA_FIELDS.state_short);
    }

    setName1(name: string) {
        this.set(SCHEMA_FIELDS.name1, name);
    }

    getName1(): string {
        return this.get(SCHEMA_FIELDS.name1);
    }

    setName2(name: string) {
        this.set(SCHEMA_FIELDS.name2, name);
    }

    getName2(): string | undefined {
        return this.get(SCHEMA_FIELDS.name2);
    }

    setPhone(phone: string) {
        this.set(SCHEMA_FIELDS.phone, phone);
    }

    getPhone(): string {
        return this.get(SCHEMA_FIELDS.phone);
    }

    setFax(fax: string) {
        this.set(SCHEMA_FIELDS.fax, fax);
    }

    getFax(): string | undefined {
        return this.get(SCHEMA_FIELDS.fax);
    }

    setZip(zip: string) {
        this.set(SCHEMA_FIELDS.zip, zip);
    }

    getZip(): string | undefined {
        return this.get(SCHEMA_FIELDS.zip);
    }

    setCity(city: string) {
        this.set(SCHEMA_FIELDS.city, city);
    }

    getCity(): string | undefined {
        return this.get(SCHEMA_FIELDS.city);
    }

    setEmail(arr: string[]) {
        this.set(SCHEMA_FIELDS.email, arr);
    }

    getEmail(): string[] | undefined {
        return this.get(SCHEMA_FIELDS.email);
    }
}

export function registerParseClass() {
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, Institution);
}
