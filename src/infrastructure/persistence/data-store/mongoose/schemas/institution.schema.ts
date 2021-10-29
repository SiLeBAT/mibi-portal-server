import { Schema } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface InstitutionDocument extends CommonDocument {
    state_short: string;
    name1: string;
    name2: string;
    zip: string;
    city: string;
    phone: string;
    fax: string;
    email: string[];
}

export const institutionSchema = new Schema<InstitutionDocument>({
    state_short: {
        type: String,
        required: true
    },
    name1: {
        type: String,
        required: true
    },
    name2: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    fax: {
        type: String
    },
    zip: {
        type: String
    },
    city: {
        type: String
    },
    email: [
        {
            type: String
        }
    ],
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
