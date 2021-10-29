import { AnalysisProcedureDocument } from './analysis-prodecure.schema';
import { Schema } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface NrlDocument extends CommonDocument {
    standardProcedures: AnalysisProcedureDocument[];
    optionalProcedures: AnalysisProcedureDocument[];
    name: string;
    email: string;
    selector: string[];
}

export const nrlSchema = new Schema<NrlDocument>({
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
