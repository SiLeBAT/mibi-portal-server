import * as mongoose from 'mongoose';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import * as bluebird from 'bluebird';

mongoose.Promise = Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var institutionSchema = new Schema({
  short: {
    type: String,
    required: true
  },
  name1: {
    type: String,
    required: true
  },
  name2: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  address1: {
    street: {
      type: String
    },
    city: {
      type: String
    }
  },
  address2: {
    street: {
      type: String
    },
    city: {
      type: String
    }
  },
  phone: {
    type: String,
    required: true
  },
  fax: {
    type: String,
    required: true
  },

  email: [{
    type: String
  }],
  state_id: {
    type: ObjectId,
    ref: 'State'
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true
  }
});

export const institution = mongoose.model('Institution', institutionSchema);
