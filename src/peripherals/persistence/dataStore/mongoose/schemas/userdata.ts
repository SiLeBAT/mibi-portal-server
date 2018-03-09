import * as mongoose from 'mongoose';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { IUserdata } from '../../../../../server/userManagement/shared/entities/user';

const Schema = mongoose.Schema;

export interface IUserdataModel extends mongoose.Document, IUserdata {
    created: Date;
    updated: Date;
}

export const userdataSchema = new Schema({
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
}).pre('save', function (next) {
    if (this._doc) {
        let doc = this._doc as IUserdataModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
    return this;
});

userdataSchema.plugin(mongooseUniqueValidator);
