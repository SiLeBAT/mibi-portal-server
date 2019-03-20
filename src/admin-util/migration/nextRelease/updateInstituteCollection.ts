import * as config from 'config';
import { logger } from '../../../aspects';
import {
    createDataStore,
    DataStoreType,
    mapCollectionToRepository
} from '../../../infrastructure/ports';
import { RepositoryBase } from '../../../app/ports';
import { InstitutionModel } from '../../../infrastructure/persistence/data-store/mongoose/schemas/institution.schema';

/**
 * Script used to split the location attribute in the institution entries into a zip and a city entry: For Ticket mps#92
 * Run: >NODE_CONFIG_DIR=../../../config node updateInstituteCollection.js
 */
start().catch(err => {
    throw err;
});

async function start() {
    updateInstitutCollection().catch((err: Error) => {
        logger.error(`Error during state insert. err= ${err}`);
        return process.exit(1);
    });
}

function connectToDB() {
    const primaryDataStore = createDataStore(DataStoreType.MONGO);
    let connectionString: string;
    try {
        connectionString = config.get('dataStore.connectionString');
    } catch (e) {
        logger.error(`Error during state insert. err= ${e}`);
        return process.exit(1);
    }
    return primaryDataStore.initialize(connectionString);
}

async function updateInstitutCollection() {
    const db = connectToDB();
    // tslint:disable-next-line:no-any
    const promises: Promise<any>[] = [];
    const repo: RepositoryBase<InstitutionModel> = mapCollectionToRepository(
        'institutions'
    ) as RepositoryBase<InstitutionModel>;
    const entries: InstitutionModel[] = await repo.retrieve();

    addZipAndCity(entries, promises, repo);
    Promise.all(promises)
        .then(() => db.close())
        .catch((err: Error) => {
            logger.error(`Error during state insert. err= ${err}`);
            return process.exit(1);
        });
    return db;
}

function addZipAndCity(
    entries: InstitutionModel[],
    // tslint:disable-next-line:no-any
    promises: Promise<any>[],
    repo: RepositoryBase<InstitutionModel>
) {
    entries.forEach((e: InstitutionModel) => {
        logger.info(`Updating entry. entry=${e.name1}`);
        const location = e.location;
        const matches = location.match(/(\d{5}) (.*)/) || ['', '', ''];
        const zip = matches[1];
        const city = matches[2];

        promises.push(
            repo.update(e._id.toString(), { zip, city }).catch(e => {
                throw e;
            })
        );
    });
}
