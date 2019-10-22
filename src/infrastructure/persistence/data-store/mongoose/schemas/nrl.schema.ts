import { AnalysisProcedureModel } from './analysisProdecure.schema';
import { Schema, Document } from 'mongoose';

export interface NRLModel extends Document {
    standardProcedures: AnalysisProcedureModel[];
    optionalProcedures: AnalysisProcedureModel[];
    name: string;
    email: string;
    selector: string[];
    created: Date;
    updated: Date;
}

export const nrlSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    selector: [
        {
            type: String
        }
    ],
    standardProcedures: [
        { type: Schema.Types.ObjectId, ref: 'AnalysisProcedure' }
    ],
    optionalProcedures: [
        { type: Schema.Types.ObjectId, ref: 'AnalysisProcedure' }
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
        let doc = this as NRLModel;
        let now = new Date();
        if (!doc.created) {
            doc.created = now;
        }
        doc.updated = now;
    }
    next();
});
