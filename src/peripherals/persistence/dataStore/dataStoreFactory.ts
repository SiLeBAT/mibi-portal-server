
import { MongooseDataStore } from './mongoose';
import { ServerError, logger } from './../../../aspects';

export interface IDataStore {
    initialize(connectionString: string): void;
}

export enum DataStoreType {
    MONGO = 'MongoDB'
}

class DataStoreError extends ServerError {}

function createDataStore(type: DataStoreType): IDataStore {
    logger.info(`Creating datastore, type=${type}`);
    switch (type) {
        case DataStoreType.MONGO:
            return new MongooseDataStore();
        default:
            throw new DataStoreError(`Unable to create datastore: Unknown DataStore Type, type=${type}`);
    }

}

export {
    createDataStore
};
