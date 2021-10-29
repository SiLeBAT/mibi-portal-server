import { Schema } from 'mongoose';
import { InstitutionDocument } from './institution.schema';
import { CommonDocument } from '../common.model';
const mongooseUniqueValidator = require('mongoose-unique-validator');

export interface UserDocument extends CommonDocument {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    institution: InstitutionDocument;
    enabled: boolean;
    adminEnabled: boolean;
    numAttempt: number;
    lastAttempt: number;
}

export const userSchema = new Schema<UserDocument>({
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
        unique: true,
        uniqueCaseInsensitive: true
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
    adminEnabled: {
        type: Boolean,
        default: false,
        required: true
    },
    numAttempt: {
        type: Number,
        default: 0,
        required: true
    },
    lastAttempt: {
        type: Number,
        default: () => Date.now(),
        required: true
    },
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution'
    },
    created: {
        type: Date,
        default: () => Date.now(),
        required: true
    },
    updated: {
        type: Date,
        default: () => Date.now(),
        required: true
    }
}).pre('save', function (next) {
    if (this) {
        let doc = this;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});

userSchema.plugin(mongooseUniqueValidator);
