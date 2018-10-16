import { Schema, Document } from 'mongoose';
import { IState } from '../../../../../app/ports';

export interface IStateModel extends Document, IState {
    created: Date;
    updated: Date;
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
    if (this) {
        let doc = this as IStateModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
