import { Schema } from 'mongoose';
import { CommonModel } from '../common.model';

export interface AnalysisProcedureModel extends CommonModel {
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
        required: true,
        unique: true
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
