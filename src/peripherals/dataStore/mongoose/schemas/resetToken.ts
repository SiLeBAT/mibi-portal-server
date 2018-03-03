import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const resetTokenSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  type: {
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
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

resetTokenSchema.pre('save', (next) => {
  // update the time stamp
  this.updated = Date.now();

  return next();
})
