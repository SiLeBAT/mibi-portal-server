import { MongooseDataStore } from './mongoose/mongoose';
import { logger } from '../../../aspects';

export interface DataStore {
    initialize(connectionString: string): DataStore;
    close(): void;
    drop(collection: string): void;
}

export enum DataStoreType {
    MONGO = 'MongoDB'
}

function createDataStore(type: DataStoreType): DataStore {
    logger.info('Creating datastore', { type: type });
    switch (type) {
        case DataStoreType.MONGO:
            return new MongooseDataStore();
        default:
            throw new Error(
                `Unable to create datastore: Unknown DataStore Type, type=${type}`
            );
    }
}

export { createDataStore };
