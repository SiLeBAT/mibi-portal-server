import Parse from 'parse/node';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'institutions',
    state_short: 'state_short',
    name1: 'name1',
    name2: 'name2',
    zip: 'zip',
    city: 'city',
    phone: 'phone',
    fax: 'fax',
    email: 'email',

} as const;

async function createSchema(): Promise<boolean> {
    const institutionSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await institutionSchema.get();
        return true;
    } catch (error) {
        if (error.message.includes(`Class ${SCHEMA_FIELDS.className} does not exist`)) {
            return institutionSchema
                .addField(
                    SCHEMA_FIELDS.state_short,
                    'String',
                    {
                        required: true
                    }
                )
                .addField(
                    SCHEMA_FIELDS.name1,
                    'String',
                    {
                        required: true
                    }
                )
                .addField(
                    SCHEMA_FIELDS.name2,
                    'String'
                )
                .addField(
                    SCHEMA_FIELDS.zip,
                    'String'
                )
                .addField(
                    SCHEMA_FIELDS.city,
                    'String'
                )
                .addField(
                    SCHEMA_FIELDS.phone,
                    'String',
                    {
                        required: true
                    }
                )
                .addArray(
                    SCHEMA_FIELDS.email
                )
                .addField(
                    SCHEMA_FIELDS.fax,
                    'String'
                )
                .save()
                .then(
                    () => {
                        logger.info(`${SCHEMA_FIELDS.className} schema saved`);
                        return true;
                    },
                    (error) => {
                        logger.error(`error saving ${SCHEMA_FIELDS.className} schema: `, error);
                        return false;
                    }
                );
        } else {
            logger.error(`error creating ${SCHEMA_FIELDS.className} schema: `, error);
            return false;
        }
    }

}

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

    getId(): string {
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

    getEmail(): string[] | undefined{
        return this.get(SCHEMA_FIELDS.email);
    }
}

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, Institution);
}
