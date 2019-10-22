import {
    Institute,
    createInstitution,
    createUser,
    User,
    State,
    ValidationError,
    NRL,
    DefaultNRLService
} from '../../../app/ports';
import { InstitutionModel } from '../data-store/mongoose/schemas/institution.schema';
import { UserModel } from '../data-store/mongoose/schemas/user.schema';
import { StateModel } from '../data-store/mongoose/schemas/state.schema';
import { ValidationErrorModel } from '../data-store/mongoose/schemas/validationError.schema';
import { NRLModel } from '../data-store/mongoose/schemas/nrl.schema';

function mapModelToInstitution(i: InstitutionModel): Institute {
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

function mapModelToUser(model: UserModel): User {
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

function mapModelToState(model: StateModel): State {
    return {
        name: model.name,
        short: model.short,
        AVV: model.AVV
    };
}

function mapModelToValidationError(
    model: ValidationErrorModel
): ValidationError {
    return {
        code: model.code,
        level: model.level,
        message: model.message
    };
}

function mapModelToNRL(model: NRLModel): NRL {
    return {
        id: DefaultNRLService.mapNRLStringToEnum(model.name),
        selectors: model.selector,
        email: model.email,
        standardProcedures: model.standardProcedures.map(p => ({
            value: p.value,
            key: p.key
        })),
        optionalProcedures: model.optionalProcedures.map(p => ({
            value: p.value,
            key: p.key
        }))
    };
}

export {
    mapModelToInstitution,
    mapModelToUser,
    mapModelToState,
    mapModelToValidationError,
    mapModelToNRL
};
