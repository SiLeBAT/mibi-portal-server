import schemaDefinitions from '../mibi-schema.json';

interface FieldDefinition {
    type: string;
    targetClass?: string;
}

interface ClassDefinition {
    className: string;
    fields: Record<string, FieldDefinition>;
    classLevelPermissions?: Record<string, unknown>;
    indexes?: Record<string, Record<string, number>>;
}

const definitions = schemaDefinitions as unknown as ClassDefinition[];
const classNames = definitions.map(d => d.className);

describe('mibi-schema.json', () => {
    it('defines every class only once', () => {
        expect(new Set(classNames).size).toBe(classNames.length);
    });

    it('defines the application classes', () => {
        expect(classNames).toEqual(
            expect.arrayContaining([
                'User_Info',
                'AVV_Catalog',
                'Template_File',
                'Analysis_Procedure',
                'Additional_Pathogens',
                'NRL',
                'Allowed_PLZ',
                'Search_Alias',
                'Client_Dashboard',
                'Zomo_Plan',
                'Zomo_Plan_File',
                'Order',
                'Sample',
                'Result'
            ])
        );
    });

    it.each(definitions)(
        '$className has class level permissions',
        definition => {
            expect(definition.classLevelPermissions).toBeDefined();
        }
    );

    // A pointer or relation to an undefined class would fail on a fresh DB.
    it.each(definitions)(
        '$className only points to defined classes',
        definition => {
            Object.values(definition.fields)
                .filter(field => field.targetClass !== undefined)
                .forEach(field => {
                    expect(classNames).toContain(field.targetClass);
                });
        }
    );

    // Parse refuses to create an index on a field that is not defined, which
    // would abort the migration on a fresh DB.
    it.each(definitions)(
        '$className only indexes defined fields',
        definition => {
            Object.values(definition.indexes ?? {}).forEach(index => {
                Object.keys(index).forEach(fieldName => {
                    expect(Object.keys(definition.fields)).toContain(fieldName);
                });
            });
        }
    );
});
