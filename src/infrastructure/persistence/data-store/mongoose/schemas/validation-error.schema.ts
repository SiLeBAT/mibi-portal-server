import { Schema } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface ValidationErrorDocument extends CommonDocument {
    code: number;
    level: number;
    message: string;
}

export const validationErrorSchema = new Schema<ValidationErrorDocument>({
    code: {
        type: Number,
        required: true
    },
    level: {
        type: Number
    },
    message: {
        type: String
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
