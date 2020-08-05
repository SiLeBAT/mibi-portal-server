// core
// npm
import mongoose from 'mongoose';
import Promise from 'bluebird';
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

export interface ConnectionInfo {
    host: string;
    database: string;
    username: string;
    password: string;
    authDatabase: string;
}

class MongooseDataStore implements DataStore {
    constructor(connectionInfo: ConnectionInfo) {
        const connectionString =
            'mongodb://' +
            connectionInfo.username +
            ':' +
            connectionInfo.password +
            '@' +
            connectionInfo.host +
            '/' +
            connectionInfo.authDatabase;
        const logString =
            '{ "host":"' +
            connectionInfo.host +
            '", "user":"' +
            connectionInfo.username +
            '", "authDB":"' +
            connectionInfo.authDatabase +
            '", "db":"' +
            connectionInfo.database +
            '" }';
        mongoose
            .connect(connectionString, {
                dbName: connectionInfo.database,
                useCreateIndex: true,
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            .then(
                db => {
                    logger.info('Connected to DB', logString);
                    return db;
                },
                error => {
                    throw new Error(
                        `Unable to connect to DB. ${logString} error=${error}`
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

export function createDataStore(connectionInfo: ConnectionInfo): DataStore {
    logger.info('Creating datastore');
    return new MongooseDataStore(connectionInfo);
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
