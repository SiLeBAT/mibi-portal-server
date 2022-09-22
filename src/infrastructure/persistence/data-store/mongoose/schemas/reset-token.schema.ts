import { Schema, Types } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface TokenDocument extends CommonDocument {
    token: string;
    type: string;
    user: Types.ObjectId;
}

export const tokenSchema = new Schema<TokenDocument>({
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
        default: () => new Date(),
        required: true
    },
    updated: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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
