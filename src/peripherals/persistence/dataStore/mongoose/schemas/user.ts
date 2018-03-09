import { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson';
import * as mongooseUniqueValidator from 'mongoose-unique-validator';
import { IUserBase } from '../../../../../server/userManagement/shared/entities';
import { IMongooseUpdateResponse } from '../mongooseRepository';

export interface IUserModelUpdateResponse extends IMongooseUpdateResponse {
}

export interface IUserModel extends Document, IUserBase {
    _id: ObjectId;
    enabled: boolean;
    created: Date;
    updated: Date;
}

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
}).pre('save', function (next) {
    if (this._doc) {
        let doc = this._doc as IUserModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
    return this;
});

userSchema.plugin(mongooseUniqueValidator);
