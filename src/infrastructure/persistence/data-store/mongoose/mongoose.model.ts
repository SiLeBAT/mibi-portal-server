import mongoose from 'mongoose';
import {
    AnalysisProcedureModel,
    analysisProcedureSchema
} from './schemas/analysis-prodecure.schema';

import {
    InstitutionModel,
    institutionSchema
} from './schemas/institution.schema';

import { NRLModel, nrlSchema } from './schemas/nrl.schema';

import { TokenModel, tokenSchema } from './schemas/reset-token.schema';

import { StateModel, stateSchema } from './schemas/state.schema';

import { UserModel, userSchema } from './schemas/user.schema';

import {
    ValidationErrorModel,
    validationErrorSchema
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
export const MongooseNRLModel: mongoose.Model<NRLModel> = mongoose.model<
    NRLModel
>('NRL', nrlSchema);
export const MongooseValidationErrorModel = mongoose.model<
    ValidationErrorModel
>('ValidationError', validationErrorSchema);

export const MongooseAnalysisProcedureModel = mongoose.model<
    AnalysisProcedureModel
>('AnalysisProcedure', analysisProcedureSchema);
