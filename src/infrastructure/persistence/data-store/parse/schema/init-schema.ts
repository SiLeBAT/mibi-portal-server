import { MongoClient } from 'mongodb';
import { ParseConnectionInfo } from '../parse';
import { logger } from './../../../../../aspects';
import {
    SCHEMA_FIELDS as PROCEDURE_FIELDS,
    registerParseClass as registerAnalysisprocedure
} from './analysisprocedure';
import { registerParseClass as registerInstitution } from './institution';
import { registerParseClass as registerToken } from './resettoken';
import { registerParseClass as registerState } from './state';
import {
    SCHEMA_FIELDS as USER_FIELDS,
    registerParseClass as registerUser
} from './user';
import { registerParseClass as registerValidationError } from './validationerror';

/**
 * +++++++ IMPORTANT +++++++
 * Objects returned from queries should use the schema subclasses of Parse.Object.
 * For that it is necessary to register the subclass.
 * For each new schema subclass add here the registration function that should be defined in each schema subclass.
 */
const REGISTER_FUNCTION_ARRAY: RegisterFunc[] = [
    registerState,
    registerInstitution,
    registerValidationError,
    registerAnalysisprocedure,
    registerUser,
    registerToken
];

interface RegisterFunc {
    (dbConfig?: ParseConnectionInfo): Promise<void>;
}

async function createUniqueIndex(
    dbConfig: ParseConnectionInfo,
    client: MongoClient
): Promise<boolean> {
    const indices: {
        collection: string;
        field: string;
    }[] = [
        {
            collection: USER_FIELDS.className,
            field: USER_FIELDS.email
        },
        {
            collection: PROCEDURE_FIELDS.className,
            field: PROCEDURE_FIELDS.key
        }
    ];

    await client.connect();

    const db = client.db(dbConfig.authDatabase);

    const result = await Promise.all(
        indices.map(async entry => {
            const collection = db.collection(entry.collection);
            const indexName = await collection.createIndex(
                {
                    [entry.field]: 1
                },
                {
                    unique: true,
                    name: `${entry.field}_idx`
                }
            );
            logger.info(`Index created: ${indexName}`);
            return;
        })
    ).then(
        () => true,
        () => false
    );

    return result;
}

export async function initSchema(dbConfig: ParseConnectionInfo): Promise<void> {
    logger.info('Initializing database schema');

    return Promise.all(
        REGISTER_FUNCTION_ARRAY.map(async (registerFunc: RegisterFunc) => {
            return registerFunc(dbConfig);
        })
    ).then(
        async () => {
            logger.info('Initializing database schema done');

            logger.info('Creating unique indices');
            const url = `mongodb://${dbConfig.host}/${dbConfig.authDatabase}`;
            const client = new MongoClient(url);
            await createUniqueIndex(dbConfig, client)
                .then(() => {
                    logger.info('Creating unique indices done');
                    return;
                })
                .catch(error => {
                    logger.error(' error creating unique indices: ', error);
                    return;
                })
                .finally(() => client.close());

            return;
        },
        error => {
            throw error;
        }
    );
}
