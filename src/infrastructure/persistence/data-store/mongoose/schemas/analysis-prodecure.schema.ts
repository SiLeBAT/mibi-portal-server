import { Schema } from 'mongoose';
import { CommonDocument } from '../common.model';

export interface AnalysisProcedureDocument extends CommonDocument {
    value: string;
    key: number;
}

export const analysisProcedureSchema = new Schema<AnalysisProcedureDocument>({
    value: {
        type: String,
        required: true
    },
    key: {
        type: Number,
        required: true,
        unique: true
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
});
