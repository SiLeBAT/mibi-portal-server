import * as mongoose from 'mongoose';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';

const Schema = mongoose.Schema;

export const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false,
    required: true
  },
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution'
  },
  userdata: [{
    type: Schema.Types.ObjectId,
    ref: 'Userdata'
  }],
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


userSchema.plugin(mongooseUniqueValidator);


