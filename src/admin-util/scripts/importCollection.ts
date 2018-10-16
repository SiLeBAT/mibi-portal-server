import * as path from 'path';
import * as readline from 'linebyline';
import * as config from 'config';
import { Document } from 'mongoose';
import { logger } from '../../aspects';
import { createDataStore, DataStoreType, createRepository } from '../../infrastructure';
import { IDataStore } from '../../infrastructure/persistence/dataStore/dataStoreFactory';
import { IRepositoryBase } from '../../app/ports';
import { StateSchema, InstitutionSchema } from '../../infrastructure/persistence/dataStore';

start().catch(err => { throw err; });

async function start() {

    let filename = parseCommandLine();
    const ext = path.extname(filename);

    switch (ext) {
        case '.txt':
            parseTabDelimitedFile(filename);
            break;
        case '.json':
        default:
    }

}

function connectToDB() {
    const primaryDataStore = createDataStore(DataStoreType.MONGO);
    return primaryDataStore.initialize(config.get('dataStore.connectionString'));
}

function insertNewEntry(collection: string, fields: string[], values: string[]) {
    // tslint:disable-next-line:no-any
    const entry: any = {};
    for (let i = 0; i < fields.length; i++) {
        entry[fields[i]] = values[i];
    }
    return entry;
}

// TODO: This should be handled elsewhere? In some other way?
function mapCollectionToRepository(collection: string): IRepositoryBase<Document> {
    switch (collection) {
        case 'states':
            return createRepository(StateSchema);
        case 'institutions':
            return createRepository(InstitutionSchema);
        default:
            throw new Error(`Collection not found. collection=${collection}`);
    }
}

function parseCommandLine(): string {
    const argv = process.argv;
    const scriptName = path.posix.basename(argv[1]);

    if (argv.length < 3) {
        printUsage(scriptName);
        process.exit(1);
    }

    return argv[2];
}

function parseTabDelimitedFile(filename: string) {
    let lineReader = readline(filename);
    let collection: string;
    let fields: string[] = [];
    // tslint:disable-next-line:no-any
    let entries: any[] = [];
    let db: IDataStore;
    lineReader.on('line', (line: string, lineCount: number) => {
        switch (lineCount) {
            case 1:
                collection = line.substring(2);
                if (!collection) {
                    throw new Error('Collection not defined.');
                }

                break;
            case 2:
                fields = line.substring(2).split('\t');
                break;
            default:
                entries.push(insertNewEntry(collection, fields, line.split('\t')));
        }
    })
        .on('close', () => {
            db = connectToDB();

            db.drop(collection);
            const repo = mapCollectionToRepository(collection);
            const promises: Promise<Document>[] = [];
            entries.forEach(e => {
                logger.info(`Adding entry to collection. collection=${collection} entry=${e}`);
                promises.push(repo.create(
                    e
                ));
            });

            Promise.all(promises).then(
                () => db.close()
            ).catch((err: Error) => {
                logger.error(`Error during state insert. err= ${err}`);
                return process.exit(1);
            });
        })
        .on('error', (error: Error) => {
            logger.error(`Error during readline. error=${error}`);
            if (db) {
                db.close();
            }
        });
}

function printUsage(scriptName: string) {
    logger.info('Usage:');
    logger.info('------');
    logger.info(`$ >node ${scriptName} <filename>.txt`);
    logger.info('');
    logger.info('.txt files should be tab delimited with 2 header lines (indicated by //) referencing the collection name and listing the field names');
    logger.info('e.g.');
    logger.info('//myCollection');
    logger.info('//filed1   field2  field3');
}
