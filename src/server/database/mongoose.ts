// core
// npm
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
// local

mongoose.Promise = Promise;

export function initialize(connecionString) {
  mongoose.connect(connecionString);

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'mongo db error: could not connect to epilab'));
  db.once('open', () => {
    const db = mongoose.connection;
    console.log('mongoose.js: mongo db: connected to epilab');
  })

  console.log('mongoose.js: nach connect to mongodb');


}
