// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { logger } from './../../../../aspects';
import { createRepository } from './mongoose.repository';
import { DataStore } from '../../model/data-store.model';
import {
    MongooseStateModel,
    MongooseInstitutionModel,
    MongooseNRLModel,
    MongooseValidationErrorModel
} from './mongoose.model';

// tslint:disable-next-line
(mongoose as any).Promise = Promise;

class MongooseDataStore implements DataStore {
    constructor(connectionString: string, dataBase: string) {
        mongoose
            .connect(connectionString, {
                dbName: dataBase,
                useCreateIndex: true,
                useNewUrlParser: true
            })
            .then(
                db => {
                    logger.info('Connected to DB', {
                        connectionString: connectionString,
                        dataBase: dataBase
                    });
                    return db;
                },
                error => {
                    throw new Error(
                        `Unable to connect to DB. connectionString=${connectionString} error=${error}`
                    );
                }
            );
    }

    close() {
        mongoose.connection
            .close()
            .then(() => {
                logger.info('Successfully closed DB');
            })
            .catch(error => {
                throw new Error(`Unable to close DB. error=${error}`);
            });
    }

    drop(collection: string) {
        const drop = mongoose.connection.collection(collection).drop();
        if (drop) {
            drop.catch(error => {
                throw new Error(`Unable to close DB. error=${error}`);
            });
        }
    }
}

export function createDataStore(
    connectionString: string,
    dataBase: string
): DataStore {
    logger.info('Creating datastore');
    return new MongooseDataStore(connectionString, dataBase);
}

export function mapCollectionToRepository(collection: string) {
    switch (collection) {
        case 'states':
            return createRepository(MongooseStateModel);
        case 'institutions':
            return createRepository(MongooseInstitutionModel);
        case 'nrls':
            return createRepository(MongooseNRLModel);
        case 'validationerrors':
            return createRepository(MongooseValidationErrorModel);
        default:
            throw new Error(`Collection not found. collection=${collection}`);
    }
}
