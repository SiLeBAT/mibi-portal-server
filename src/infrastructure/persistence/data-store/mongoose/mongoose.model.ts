import {
    AnalysisProcedureDocument,
    analysisProcedureSchema
} from './schemas/analysis-prodecure.schema';
import mongoose from 'mongoose';

import {
    institutionSchema,
    InstitutionDocument
} from './schemas/institution.schema';

import { nrlSchema, NrlDocument } from './schemas/nrl.schema';

import { tokenSchema, TokenDocument } from './schemas/reset-token.schema';

import { StateDocument, stateSchema } from './schemas/state.schema';

import { userSchema, UserDocument } from './schemas/user.schema';

import {
    validationErrorSchema,
    ValidationErrorDocument
} from './schemas/validation-error.schema';

export const MongooseStateModel = mongoose.model<StateDocument>(
    'State',
    stateSchema
);
export const MongooseInstitutionModel = mongoose.model<InstitutionDocument>(
    'Institution',
    institutionSchema
);
export const MongooseTokenModel = mongoose.model<TokenDocument>(
    'ResetToken',
    tokenSchema
);
export const MongooseUserModel = mongoose.model<UserDocument>('User', userSchema);
export const MongooseNRLModel: mongoose.Model<NrlDocument> = mongoose.model<
    NrlDocument
>('NRL', nrlSchema);
export const MongooseValidationErrorModel = mongoose.model<
    ValidationErrorDocument
>('ValidationError', validationErrorSchema);

export const MongooseAnalysisProcedureModel = mongoose.model<
    AnalysisProcedureDocument
>('AnalysisProcedure', analysisProcedureSchema);
