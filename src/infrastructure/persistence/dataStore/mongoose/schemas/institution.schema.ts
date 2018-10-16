import { Schema, Document } from 'mongoose';
import { IInstitution } from '../../../../../app/ports';

export interface IInstitutionModel extends Document, IInstitution {
    created: Date;
    updated: Date;
}

export const institutionSchema = new Schema({
    short: {
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
    location: {
        type: String,
        required: true
    },
    address1: {
        street: {
            type: String
        },
        city: {
            type: String
        }
    },
    address2: {
        street: {
            type: String
        },
        city: {
            type: String
        }
    },
    phone: {
        type: String,
        required: true
    },
    fax: {
        type: String
    },

    email: [{
        type: String
    }],
    state_id: {
        type: Schema.Types.ObjectId,
        ref: 'State'
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
        let doc = this as IInstitutionModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
