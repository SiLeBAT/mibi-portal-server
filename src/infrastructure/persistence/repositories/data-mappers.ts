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
import { InstitutionDocument } from '../data-store/mongoose/schemas/institution.schema';
import { UserDocument } from '../data-store/mongoose/schemas/user.schema';
import { StateDocument } from '../data-store/mongoose/schemas/state.schema';
import { ValidationErrorDocument } from '../data-store/mongoose/schemas/validation-error.schema';
import { NrlDocument } from '../data-store/mongoose/schemas/nrl.schema';

function mapModelToInstitution(i: InstitutionDocument): Institute {
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

function mapModelToUser(model: UserDocument): User {
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

function mapModelToState(model: StateDocument): State {
    return {
        name: model.name,
        short: model.short,
        AVV: model.AVV
    };
}

function mapModelToValidationError(
    model: ValidationErrorDocument
): ValidationError {
    return {
        code: model.code,
        level: model.level,
        message: model.message
    };
}

function mapModelToNRL(model: NrlDocument): NRL {
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
