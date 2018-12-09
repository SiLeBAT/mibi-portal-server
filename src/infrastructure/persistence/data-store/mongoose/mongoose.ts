// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { IDataStore } from '../data-store.factory';
import { logger } from './../../../../aspects';

import { nrlSchema, institutionSchema, userSchema, resetTokenSchema, IResetTokenModel, IInstitutionModel, IUserModel, IStateModel, stateSchema, INRLModel, validationErrorSchema, IValidationErrorModel } from './schemas';
import { IRepositoryBase } from '../../../../app/ports';
import { createRepository } from '.';

// tslint:disable-next-line
(mongoose as any).Promise = Promise;

export class MongooseDataStore implements IDataStore {
    initialize(connecionString: string) {
        mongoose.connect(connecionString).then(
            db => {
                logger.info('Connected to DB', { connectionString: connecionString });
                return db;
            },
            err => { throw new Error(`Unable to connect to DB. connectionString=${connecionString} error=${err}`); }
        );
        return this;
    }

    close() {
        mongoose.connection.close().then(
            () => {
                logger.info('Successfully closed DB');
            }
        ).catch(
            err => { throw new Error(`Unable to close DB. error=${err}`); }
        );
    }

    drop(collection: string) {
        const drop = mongoose.connection.collection(collection).drop();
        if (drop) {
            drop.catch(
                err => { throw new Error(`Unable to close DB. error=${err}`); }
            );
        }
    }
}

export const StateSchema = mongoose.model<IStateModel>('State', stateSchema);
export const InstitutionSchema = mongoose.model<IInstitutionModel>('Institution', institutionSchema);
export const ResetTokenSchema = mongoose.model<IResetTokenModel>('ResetToken', resetTokenSchema);
export const UserSchema = mongoose.model<IUserModel>('User', userSchema);
export const NRLSchema = mongoose.model<INRLModel>('NRL', nrlSchema);
export const ValidationErrorSchema = mongoose.model<IValidationErrorModel>('ValidationError', validationErrorSchema);

// TODO: This should be handled elsewhere? In some other way?
export function mapCollectionToRepository(collection: string): IRepositoryBase<mongoose.Document> {
    switch (collection) {
        case 'states':
            return createRepository(StateSchema);
        case 'institutions':
            return createRepository(InstitutionSchema);
        case 'nrls':
            return createRepository(NRLSchema);
        case 'validationerrors':
            return createRepository(ValidationErrorSchema);
        default:
            throw new Error(`Collection not found. collection=${collection}`);
    }
}
