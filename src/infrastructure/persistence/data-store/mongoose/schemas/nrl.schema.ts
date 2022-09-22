import { Schema, Types } from 'mongoose';
import { CommonDocument } from '../common.model';
import { AnalysisProcedureDocument } from './analysis-prodecure.schema';

export interface NrlDocument extends CommonDocument {
    standardProcedures: Types.ObjectId[];
    optionalProcedures: Types.ObjectId[];
    name: string;
    email: string;
    selector: string[];
}

export interface PopulatedNrlDocument
    extends Omit<NrlDocument, 'standardProcedures' | 'optionalProcedures'> {
    standardProcedures: AnalysisProcedureDocument[];
    optionalProcedures: AnalysisProcedureDocument[];
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
