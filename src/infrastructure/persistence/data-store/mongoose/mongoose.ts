// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { DataStore } from '../data-store.factory';
import { logger } from './../../../../aspects';

import {
    institutionSchema,
    InstitutionModel
} from './schemas/institution.schema';

import { nrlSchema, NRLModel } from './schemas/nrl.schema';

import { resetTokenSchema, ResetTokenModel } from './schemas/resetToken.schema';

import { StateModel, stateSchema } from './schemas/state.schema';

import { userSchema, UserModel } from './schemas/user.schema';

import {
    validationErrorSchema,
    ValidationErrorModel
} from './schemas/validationError.schema';

import { createRepository, RepositoryBase } from './mongoose.repository';

// tslint:disable-next-line
(mongoose as any).Promise = Promise;

export class MongooseDataStore implements DataStore {
    initialize(connecionString: string) {
        mongoose.connect(connecionString).then(
            db => {
                logger.info('Connected to DB', {
                    connectionString: connecionString
                });
                return db;
            },
            err => {
                throw new Error(
                    `Unable to connect to DB. connectionString=${connecionString} error=${err}`
                );
            }
        );
        return this;
    }

    close() {
        mongoose.connection
            .close()
            .then(() => {
                logger.info('Successfully closed DB');
            })
            .catch(err => {
                throw new Error(`Unable to close DB. error=${err}`);
            });
    }

    drop(collection: string) {
        const drop = mongoose.connection.collection(collection).drop();
        if (drop) {
            drop.catch(err => {
                throw new Error(`Unable to close DB. error=${err}`);
            });
        }
    }
}

export const StateSchema = mongoose.model<StateModel>('State', stateSchema);
export const InstitutionSchema = mongoose.model<InstitutionModel>(
    'Institution',
    institutionSchema
);
export const ResetTokenSchema = mongoose.model<ResetTokenModel>(
    'ResetToken',
    resetTokenSchema
);
export const UserSchema = mongoose.model<UserModel>('User', userSchema);
export const NRLSchema = mongoose.model<NRLModel>('NRL', nrlSchema);
export const ValidationErrorSchema = mongoose.model<ValidationErrorModel>(
    'ValidationError',
    validationErrorSchema
);

export function mapCollectionToRepository(
    collection: string
): RepositoryBase<mongoose.Document> {
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
