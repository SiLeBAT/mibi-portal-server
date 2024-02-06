import Parse from 'parse/node';
import {
    AnalysisProcedure,
    SCHEMA_FIELDS as ANALYSISPROCEDURE_FIELDS
} from './analysisprocedure';
import { logger } from './../../../../../aspects';

export const SCHEMA_FIELDS = {
    className: 'nrls',
    name: 'name',
    selector: 'selector',
    email: 'email',
    standardProcedures: 'standardProcedures',
    optionalProcedures: 'optionalProcedures'
} as const;

async function createSchema(): Promise<boolean> {
    const nrlSchema = new Parse.Schema(SCHEMA_FIELDS.className);

    try {
        await nrlSchema.get();
        return true;
    } catch (error) {
        if (
            error.message.includes(
                `Class ${SCHEMA_FIELDS.className} does not exist`
            )
        ) {
            return nrlSchema
                .addField(SCHEMA_FIELDS.name, 'String', {
                    required: true
                })
                .addArray(SCHEMA_FIELDS.selector)
                .addField(SCHEMA_FIELDS.email, 'String')
                .addRelation(
                    SCHEMA_FIELDS.standardProcedures,
                    ANALYSISPROCEDURE_FIELDS.className
                )
                .addRelation(
                    SCHEMA_FIELDS.optionalProcedures,
                    ANALYSISPROCEDURE_FIELDS.className
                )
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
export interface INrl extends Parse.Attributes {
    name: string;
    selector?: string[];
    email?: string;
    standardProcedures?: Parse.Relation;
    optionalProcedures?: Parse.Relation;
}

export class Nrl extends Parse.Object<INrl> {
    private standardProceduresList: AnalysisProcedure[] = [];
    private optionalProceduresList: AnalysisProcedure[] = [];

    constructor(attributes: INrl) {
        // Pass the ClassName to the Parse.Object constructor
        super(SCHEMA_FIELDS.className, attributes);
    }

    getId(): string {
        return this.id;
    }

    setName(name: string) {
        this.set(SCHEMA_FIELDS.name, name);
    }

    getName(): string {
        return this.get(SCHEMA_FIELDS.name);
    }

    setSelector(arr: string[]) {
        this.set(SCHEMA_FIELDS.selector, arr);
    }

    addSelectorItem(selectorItem: string) {
        let currentSelector: string[] | undefined = this.getSelector();
        if (currentSelector) {
            currentSelector.push(selectorItem);
        } else {
            currentSelector = [selectorItem];
        }

        this.setSelector(currentSelector);
    }

    getSelector(): string[] | undefined {
        return this.get(SCHEMA_FIELDS.selector);
    }

    setEmail(email: string) {
        this.set(SCHEMA_FIELDS.email, email);
    }

    getEmail(): string | undefined {
        return this.get(SCHEMA_FIELDS.email);
    }

    addStandardProcedure(procedure: AnalysisProcedure | AnalysisProcedure[]) {
        (this as Parse.Object)
            .relation(SCHEMA_FIELDS.standardProcedures)
            .add(procedure);
    }

    removeStandardProcedure(
        procedure: AnalysisProcedure | AnalysisProcedure[]
    ) {
        (this as Parse.Object)
            .relation(SCHEMA_FIELDS.standardProcedures)
            .remove(procedure);
    }

    getStandardProcedures(): Parse.Relation {
        return (this as Parse.Object).relation(
            SCHEMA_FIELDS.standardProcedures
        );
    }

    setStandardProcedureList(list: AnalysisProcedure[]) {
        this.standardProceduresList = list;
    }

    getStandardProcedureList(): AnalysisProcedure[] {
        return this.standardProceduresList;
    }

    addOptionalProcedure(procedure: AnalysisProcedure | AnalysisProcedure[]) {
        (this as Parse.Object)
            .relation(SCHEMA_FIELDS.optionalProcedures)
            .add(procedure);
    }

    removeOptionalProcedure(
        procedure: AnalysisProcedure | AnalysisProcedure[]
    ) {
        (this as Parse.Object)
            .relation(SCHEMA_FIELDS.optionalProcedures)
            .remove(procedure);
    }

    getOptionalProcedures(): Parse.Relation {
        return (this as Parse.Object).relation(
            SCHEMA_FIELDS.optionalProcedures
        );
    }

    setOptionalProcedureList(list: AnalysisProcedure[]) {
        this.optionalProceduresList = list;
    }

    getOptionalProcedureList(): AnalysisProcedure[] {
        return this.optionalProceduresList;
    }
}

export async function registerParseClass() {
    await createSchema();
    Parse.Object.registerSubclass(SCHEMA_FIELDS.className, Nrl);
}
