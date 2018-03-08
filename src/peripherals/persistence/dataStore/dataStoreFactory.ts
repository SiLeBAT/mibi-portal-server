
import { MongooseDataStore } from './mongoose';
import { ServerError, logger } from './../../../aspects';

export interface IDataStore {
    initialize(connectionString: string): void;
}

export enum DataStoreType {
    MONGO = 'MongoDB'
}

function createDataStore(type: DataStoreType): IDataStore {
    logger.info('Creating datastore of type: ', type);
    switch (type) {
    case DataStoreType.MONGO:
        return new MongooseDataStore();
    default:
        logger.error('Unable to create datastore: Unknown DataStore Type');
        throw new ServerError('Unknown DataStore Type');
    }

}

export {
    createDataStore
};
