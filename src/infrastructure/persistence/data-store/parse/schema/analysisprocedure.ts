import Parse from 'parse/node';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'analysisprocedures',
    key: 'key',
    value: 'value'
} as const;

async function createSchema(): Promise<boolean> {
    const procedureSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await procedureSchema.get();
        return true;
    } catch (error) {
        if (error.message.includes(`Class ${SCHEMA_FIELDS.className} does not exist`)) {
            return procedureSchema
                .addField(
                    SCHEMA_FIELDS.key,
                    'Number',
                    {
                        required: true
                    }
                )
                .addField(
                    SCHEMA_FIELDS.value,
                    'String',
                    {
                        required: true
                    }
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

export interface IAnalysisProcedure extends Parse.Attributes {
    key: number;
    value: string;
}

export class AnalysisProcedure extends Parse.Object<IAnalysisProcedure> {

    constructor(attributes: IAnalysisProcedure) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string {
        return this.id;
    }

    setKey(key: number) {
        this.set(SCHEMA_FIELDS.key, key);
    }

    getKey(): number {
        return this.get(SCHEMA_FIELDS.key);
    }

    setValue(value: string) {
        this.set(SCHEMA_FIELDS.value, value);
    }

    getValue(): string {
        return this.get(SCHEMA_FIELDS.value);
    }

}

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, AnalysisProcedure);
}
