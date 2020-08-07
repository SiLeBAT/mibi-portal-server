import { Schema } from 'mongoose';
import { UserToken } from '../../../../../app/ports';
import { CommonModel } from '../common.model';

export interface TokenModel extends CommonModel, UserToken {
    user: string;
}

export const tokenSchema = new Schema({
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
}).pre('save', function(next) {
    if (this) {
        let doc = this as TokenModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
