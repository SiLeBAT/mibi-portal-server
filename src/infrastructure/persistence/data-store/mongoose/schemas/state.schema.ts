import { Schema } from 'mongoose';
import { CommonModel } from '../common.model';

export interface StateModel extends CommonModel {
    name: string;
    short: string;
    AVV: string[];
}

export const stateSchema = new Schema({
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
        default: Date.now,
        required: true
    },
    updated: {
        type: Date,
        default: Date.now,
        required: true
    }
}).pre('save', function(next) {
    if (this) {
        let doc = this as StateModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
