import * as mongoose from 'mongoose';
import { IUserToken } from '../../../../../server/userManagement/shared/entities';

const Schema = mongoose.Schema;

export interface IResetTokenModel extends mongoose.Document, IUserToken {
    created: Date;
    updated: Date;
}

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
}).pre('save', function (next) {
    if (this._doc) {
        let doc = this._doc as IResetTokenModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
    return this;
});
