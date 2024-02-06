import Parse from 'parse/node';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'states',
    short: 'short',
    name: 'name',
    AVV: 'AVV'
} as const;

async function createSchema(): Promise<boolean> {
    const stateSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await stateSchema.get();
        return true;
    } catch (error) {
        if (
            error.message.includes(
                `Class ${SCHEMA_FIELDS.className} does not exist`
            )
        ) {
            return stateSchema
                .addField(SCHEMA_FIELDS.short, 'String', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.name, 'String', {
                    required: true
                })
                .addArray(SCHEMA_FIELDS.AVV)
                .save()
                .then(
                    () => {
                        logger.info(`${SCHEMA_FIELDS.className} schema saved`);
                        return true;
                    },
                    error => {
                        logger.error(
                            `error saving ${SCHEMA_FIELDS.className} schema: `,
                            error
                        );
                        return false;
                    }
                );
        } else {
            logger.error(
                `error creating ${SCHEMA_FIELDS.className} schema: `,
                error
            );
            return false;
        }
    }
}
export interface IState extends Parse.Attributes {
    short: string;
    name: string;
    AVV?: string[];
}
export class State extends Parse.Object<IState> {
    constructor(attributes: IState) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string {
        return this.id;
    }

    setShort(short: string) {
        this.set(SCHEMA_FIELDS.short, short);
    }

    getShort(): string {
        return this.get(SCHEMA_FIELDS.short);
    }

    setName(name: string) {
        this.set(SCHEMA_FIELDS.name, name);
    }

    getName(): string {
        return this.get(SCHEMA_FIELDS.name);
    }

    setAVV(arr: string[]) {
        this.set(SCHEMA_FIELDS.AVV, arr);
    }

    getAVV(): string[] | undefined {
        return this.get(SCHEMA_FIELDS.AVV);
    }
}

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, State);
}
