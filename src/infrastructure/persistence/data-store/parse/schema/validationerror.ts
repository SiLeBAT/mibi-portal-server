import Parse from 'parse/node';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'validationerrors',
    code: 'code',
    level: 'level',
    message: 'message'
} as const;

async function createSchema(): Promise<boolean> {
    const errorSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await errorSchema.get();
        return true;
    } catch (error) {
        if (
            error.message.includes(
                `Class ${SCHEMA_FIELDS.className} does not exist`
            )
        ) {
            return errorSchema
                .addField(SCHEMA_FIELDS.code, 'Number', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.level, 'Number', {
                    required: true
                })
                .addField(SCHEMA_FIELDS.message, 'String', {
                    required: true
                })
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

export interface IValidationError extends Parse.Attributes {
    code: number;
    level: number;
    message: string;
}

export class ValidationError extends Parse.Object<IValidationError> {
    constructor(attributes: IValidationError) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string {
        return this.id;
    }

    setCode(code: number) {
        this.set(SCHEMA_FIELDS.code, code);
    }

    getCode(): number {
        return this.get(SCHEMA_FIELDS.code);
    }

    setLevel(level: number) {
        this.set(SCHEMA_FIELDS.level, level);
    }

    getLevel(): number {
        return this.get(SCHEMA_FIELDS.level);
    }

    setMessage(message: string) {
        this.set(SCHEMA_FIELDS.message, message);
    }

    getMessage(): string {
        return this.get(SCHEMA_FIELDS.message);
    }
}

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, ValidationError);
}
