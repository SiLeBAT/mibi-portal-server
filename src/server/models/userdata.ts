import * as mongoose from 'mongoose';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

var userdataSchema = new Schema({
  department: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
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


userdataSchema.plugin(mongooseUniqueValidator);

export const userdata = mongoose.model('Userdata', userdataSchema);
