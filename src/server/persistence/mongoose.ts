// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local
import { logger } from './../aspects/logging'
import { IDataStore } from '../interactors';

mongoose.Promise = Promise;

export class MongooseDataStore implements IDataStore {

  public initialize(connecionString) {
    mongoose.connect(connecionString);

    const db = mongoose.connection;
    db.on('error', logger.error.bind(logger, 'mongo db error: could not connect to epilab'));
    db.once('open', () => {
      const db = mongoose.connection;
      logger.info('mongoose.js: mongo db: connected to epilab');
    })

    logger.info('mongoose.js: nach connect to mongodb');


  }
}
