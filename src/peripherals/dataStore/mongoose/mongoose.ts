// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { IDataStore } from './../dataStoreFactory';
import { logger } from './../../../aspects';

import { institutionSchema } from './schemas';
import { userSchema } from './schemas';
import { userdataSchema } from './schemas';
import { resetTokenSchema } from './schemas';

mongoose.Promise = Promise;

export class MongooseDataStore implements IDataStore {
  constructor() { }

  public initialize(connecionString) {
    mongoose.connect(connecionString, {
      useMongoClient: true
    });

    const db = mongoose.connection;
    db.on('error', logger.error.bind(logger, 'mongo db error: could not connect to epilab database'));
    db.once('open', () => {
      const db = mongoose.connection;
      logger.info('mongoose.js: mongo db: connected to epilab');

    })
  }
}

export const Institution = mongoose.model('Institution', institutionSchema);
export const ResetToken = mongoose.model('ResetToken', resetTokenSchema);
export const User = mongoose.model('User', userSchema);
export const Userdata = mongoose.model('Userdata', userdataSchema);
