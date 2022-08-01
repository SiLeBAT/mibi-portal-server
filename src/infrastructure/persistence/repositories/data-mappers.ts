import {
    Institute,
    createInstitution,
    createUser,
    User,
    State,
    ValidationError,
    NRL,
    DefaultNRLService,
    UserToken
} from '../../../app/ports';
import { InstitutionDocument } from '../data-store/mongoose/schemas/institution.schema';
import { PopulatedUserDocument } from '../data-store/mongoose/schemas/user.schema';
import { StateDocument } from '../data-store/mongoose/schemas/state.schema';
import { ValidationErrorDocument } from '../data-store/mongoose/schemas/validation-error.schema';
import { TokenDocument } from '../data-store/mongoose/schemas/reset-token.schema';
import { PopulatedNrlDocument } from '../data-store/mongoose/schemas/nrl.schema';

export function mapToInstitution(doc: InstitutionDocument): Institute {
    const inst = createInstitution(doc._id.toHexString());
    return {
        ...inst,
        ...{
            stateShort: doc.state_short,
            name: doc.name1,
            addendum: doc.name2,
            city: doc.city,
            zip: doc.zip,
            phone: doc.phone,
            fax: doc.fax,
            email: doc.email
        }
    };
}

export function mapToUser(doc: PopulatedUserDocument): User {
    const institution = mapToInstitution(doc.institution);

    return createUser(
        doc._id.toHexString(),
        doc.email,
        doc.firstName,
        doc.lastName,
        institution,
        doc.password,
        doc.enabled,
        doc.adminEnabled,
        doc.numAttempt,
        doc.lastAttempt
    );
}

export function mapToUserToken(doc: TokenDocument): UserToken {
    return {
        token: doc.token,
        type: Number.parseInt(doc.type, 10),
        userId: doc.user.toHexString()
    };
}

export function mapToState(doc: StateDocument): State {
    return {
        name: doc.name,
        short: doc.short,
        AVV: doc.AVV
    };
}

export function mapToValidationError(
    doc: ValidationErrorDocument
): ValidationError {
    return {
        code: doc.code,
        level: doc.level,
        message: doc.message
    };
}

export function mapToNRL(doc: PopulatedNrlDocument): NRL {
    return {
        id: DefaultNRLService.mapNRLStringToEnum(doc.name),
        selectors: doc.selector,
        email: doc.email,
        standardProcedures: doc.standardProcedures.map(p => ({
            value: p.value,
            key: p.key
        })),
        optionalProcedures: doc.optionalProcedures.map(p => ({
            value: p.value,
            key: p.key
        }))
    };
}
