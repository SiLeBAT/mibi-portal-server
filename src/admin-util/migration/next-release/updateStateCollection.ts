import * as path from 'path';
import * as fs from 'fs';
import * as config from 'config';
import * as _ from 'lodash';
import { Document } from 'mongoose';
import { logger } from '../../../aspects';
import {
    createDataStore,
    mapCollectionToRepository
} from '../../../infrastructure/ports';
import { StateModel } from 'src/infrastructure/persistence/data-store/mongoose/schemas/state.schema';

start().catch(err => {
    throw err;
});

async function start() {
    let filename = parseCommandLine();
    const ext = path.extname(filename);

    switch (ext) {
        case '.json':
            parseJSONFile(filename);
            break;
        default:
            throw new Error('File extension not recognized: ' + ext);
    }
}

function connectToDB() {
    return createDataStore(config.get('dataStore.connectionString'));
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

function parseJSONFile(filename: string) {
    const rawData = fs.readFileSync(filename, { encoding: 'UTF-8' });
    const data = JSON.parse(rawData);
    const collection = path.basename(filename, '.json');
    // tslint:disable-next-line:no-any
    let entries: any[] = [];
    if (Array.isArray(data)) {
        entries = data;
    } else {
        entries = [data];
    }
    writeToDB(collection, entries).catch(e => {
        throw e;
    });
}

// tslint:disable-next-line:no-any
async function writeToDB(collection: string, entries: any[]) {
    const db = connectToDB();

    // tslint:disable-next-line: no-any
    const repo: any = mapCollectionToRepository(collection);

    const originals: StateModel[] = await repo._retrieve();

    const promises: Promise<Document>[] = amendAVVEntries(
        originals,
        entries,
        repo
    );

    Promise.all(promises)
        .then(() => db.close())
        .catch((err: Error) => {
            logger.error(`Error during state insert. err= ${err}`);
            return process.exit(1);
        });
    return db;
}

function amendAVVEntries(
    originals: StateModel[],
    entries: StateModel[],
    // tslint:disable-next-line: no-any
    repo: any
) {
    const promises: Promise<Document>[] = [];
    originals.forEach((e: StateModel) => {
        logger.info(`Updating entry. entry=${e.short}`);
        const theEntry = _.find(entries, { short: e.short });

        if (theEntry) {
            const AVV = theEntry.AVV;
            promises.push(
                repo._update(e._id.toString(), { AVV }).catch((err: Error) => {
                    throw err;
                })
            );
        }
    });

    return promises;
}

function printUsage(scriptName: string) {
    logger.info('Usage:');
    logger.info('------');
    logger.info(`$ >node ${scriptName} <filename>.<txt|json>`);
    logger.info('');
    logger.info(
        '.txt files should be tab delimited with 2 header lines (indicated by //) referencing the collection name and listing the field names'
    );
    logger.info('e.g.');
    logger.info('//myCollection');
    logger.info('');
    logger.info(
        '.json files should have the basename of the file be the name of the collection'
    );
    logger.info('e.g.');
    logger.info('institutions.json');
}
