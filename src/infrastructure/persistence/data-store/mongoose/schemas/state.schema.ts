import { Schema } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface StateDocument extends CommonDocument {
    name: string;
    short: string;
    AVV: string[];
}

export const stateSchema = new Schema<StateDocument>({
    short: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    AVV: [
        {
            type: String
        }
    ],
    created: {
        type: Date,
        default: () => new Date(),
        required: true
    },
    updated: {
        type: Date,
        default: () => new Date(),
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
