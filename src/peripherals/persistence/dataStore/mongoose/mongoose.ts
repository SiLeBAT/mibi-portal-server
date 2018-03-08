// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { IDataStore } from './../dataStoreFactory';
import { logger } from './../../../../aspects';

import { institutionSchema, userSchema, userdataSchema,resetTokenSchema, IResetTokenModel, IInstitutionModel, IUserModel, IUserdataModel } from './schemas';

// tslint:disable-next-line
(mongoose as any).Promise = Promise;

export class MongooseDataStore implements IDataStore {
    initialize(connecionString: string) {
        mongoose.connect(connecionString);

        const db = mongoose.connection;
        db.on('error', logger.error.bind(logger, 'mongo db error: could not connect to epilab database'));
        db.once('open', () => {
            logger.info('mongoose.js: mongo db: connected to epilab');
        });
    }
}

export const InstitutionSchema = mongoose.model<IInstitutionModel>('Institution', institutionSchema);
export const ResetTokenSchema = mongoose.model<IResetTokenModel>('ResetToken', resetTokenSchema);
export const UserSchema = mongoose.model<IUserModel>('User', userSchema);
export const UserdataSchema = mongoose.model<IUserdataModel>('Userdata', userdataSchema);
