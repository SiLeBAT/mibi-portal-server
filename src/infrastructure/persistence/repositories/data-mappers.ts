import { Institution, createInstitution, createUser, IUser, IState, ValidationError, INRL } from '../../../app/ports';
import { IValidationErrorModel, IInstitutionModel, IUserModel, IStateModel, INRLModel } from '../data-store';

function mapModelToInstitution(i: IInstitutionModel): Institution {
    const inst = createInstitution(i._id);
    return {
        ...inst, ...{
            stateShort: i.state_short,
            name1: i.name1,
            name2: i.name2,
            location: i.location,
            address1: i.address1,
            address2: i.address2,
            phone: i.phone,
            fax: i.fax,
            email: i.email
        }
    };
}

function mapModelToUser(model: IUserModel): IUser {
    // tslint:disable-next-line:no-any
    const institution = mapModelToInstitution(model.institution);
    return createUser(model._id.toHexString(),
        model.email,
        model.firstName,
        model.lastName,
        institution,
        model.password,
        model.enabled,
        model.adminEnabled,
        model.numAttempt,
        model.lastAttempt);
}

function mapModelToState(model: IStateModel): IState {
    return {
        name: model.name,
        short: model.short,
        AVV: model.AVV
    };
}

function mapModelToValidationError(model: IValidationErrorModel): ValidationError {
    return {
        code: model.code,
        level: model.level,
        message: model.message
    };
}

function mapModelToNRL(model: INRLModel): INRL {
    return {
        name: model.name,
        selectors: model.selector
    };
}

export {
    mapModelToInstitution,
    mapModelToUser,
    mapModelToState,
    mapModelToValidationError,
    mapModelToNRL
};
