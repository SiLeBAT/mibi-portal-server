import {
    AnalysisProcedureModel,
    analysisProcedureSchema
} from './schemas/analysis-prodecure.schema';
import mongoose from 'mongoose';

import {
    institutionSchema,
    InstitutionModel
} from './schemas/institution.schema';

import { nrlSchema, NRLModel } from './schemas/nrl.schema';

import { tokenSchema, TokenModel } from './schemas/reset-token.schema';

import { StateModel, stateSchema } from './schemas/state.schema';

import { userSchema, UserModel } from './schemas/user.schema';

import {
    validationErrorSchema,
    ValidationErrorModel
} from './schemas/validation-error.schema';

export const MongooseStateModel = mongoose.model<StateModel>(
    'State',
    stateSchema
);
export const MongooseInstitutionModel = mongoose.model<InstitutionModel>(
    'Institution',
    institutionSchema
);
export const MongooseTokenModel = mongoose.model<TokenModel>(
    'ResetToken',
    tokenSchema
);
export const MongooseUserModel = mongoose.model<UserModel>('User', userSchema);
export const MongooseNRLModel: mongoose.Model<NRLModel> =
    mongoose.model<NRLModel>('NRL', nrlSchema);
export const MongooseValidationErrorModel =
    mongoose.model<ValidationErrorModel>(
        'ValidationError',
        validationErrorSchema
    );

export const MongooseAnalysisProcedureModel =
    mongoose.model<AnalysisProcedureModel>(
        'AnalysisProcedure',
        analysisProcedureSchema
    );
