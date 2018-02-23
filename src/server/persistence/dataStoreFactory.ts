import { IDataStore } from './../interactors';
import { MongooseDataStore } from './mongoose';
import { ServerError } from './../aspects';

export enum DataStoreType {
    MONGO
}

function createDataStore(type: DataStoreType): IDataStore {
    switch (type) {
        case DataStoreType.MONGO:
            return new MongooseDataStore();
        default:
            throw new ServerError('Unknown DataStore Type');
    }


}

export {
    createDataStore
}