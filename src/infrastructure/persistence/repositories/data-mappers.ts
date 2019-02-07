import {
    Institution,
    createInstitution,
    createUser,
    User,
    State,
    ValidationError,
    INRL
} from '../../../app/ports';
import {
    IValidationErrorModel,
    InstitutionModel,
    IUserModel,
    IStateModel,
    INRLModel
} from '../data-store';

function mapModelToInstitution(i: InstitutionModel): Institution {
    const inst = createInstitution(i._id);
    return {
        ...inst,
        ...{
            stateShort: i.state_short,
            name: i.name1,
            addendum: i.name2,
            city: i.city,
            zip: i.zip,
            phone: i.phone,
            fax: i.fax,
            email: i.email
        }
    };
}

function mapModelToUser(model: IUserModel): User {
    const institution = mapModelToInstitution(model.institution);
    return createUser(
        model._id.toHexString(),
        model.email,
        model.firstName,
        model.lastName,
        institution,
        model.password,
        model.enabled,
        model.adminEnabled,
        model.numAttempt,
        model.lastAttempt
    );
}

function mapModelToState(model: IStateModel): State {
    return {
        name: model.name,
        short: model.short,
        AVV: model.AVV
    };
}

function mapModelToValidationError(
    model: IValidationErrorModel
): ValidationError {
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
