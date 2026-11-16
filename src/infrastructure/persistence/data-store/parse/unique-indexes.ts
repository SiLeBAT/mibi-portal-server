import { MongoClient } from 'mongodb';
import { logger } from './../../../../aspects';
import { SCHEMA_FIELDS as USER_FIELDS } from './entities/user.entity';
import { ParseConnectionInfo } from './parse-data-store';

// Parse schema definitions (mibi-schema.json) cannot express unique indexes,
// so they are created directly in MongoDB.
async function createUniqueIndex(
    dbConfig: ParseConnectionInfo,
    client: MongoClient
): Promise<boolean> {
    const indices: {
        collection: string;
        field: string;
        sparse?: boolean;
    }[] = [
        {
            collection: USER_FIELDS.className,
            field: USER_FIELDS.email
        },
        {
            collection: USER_FIELDS.className,
            field: USER_FIELDS.sub,
            sparse: true
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
                    sparse: entry.sparse ?? false,
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

export async function createUniqueIndexes(
    dbConfig: ParseConnectionInfo
): Promise<void> {
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
        .finally(async () => client.close());
}
