import { Schema } from 'mongoose';
import { UserToken } from '../../../../../app/ports';
import { CommonDocument } from '../common.model';

export interface TokenDocument extends CommonDocument, UserToken {
    user: string;
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
        default: () => Date.now(),
        required: true
    },
    updated: {
        type: Date,
        default: () => Date.now(),
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
