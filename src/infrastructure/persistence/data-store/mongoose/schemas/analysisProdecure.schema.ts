import { Schema, Document } from 'mongoose';

export interface AnalysisProcedureModel extends Document {
    created: Date;
    updated: Date;
    value: string;
    key: number;
}

export const analysisProcedureSchema = new Schema({
    value: {
        type: String,
        required: true
    },
    key: {
        type: Number,
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
});
