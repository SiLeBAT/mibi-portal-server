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
} from '../../../../app/ports';
import { Institution } from '../../data-store/parse/schema/institution';
import { Token } from '../../data-store/parse/schema/resettoken';
import { Nrl as ParseNrl } from '../../data-store/parse/schema/nrl';
import { User as ParseUser } from '../../data-store/parse/schema/user';
import { State as ParseState } from '../../data-store/parse/schema/state';
import { ValidationError as ParseValidationError } from '../../data-store/parse/schema/validationerror';

export function mapToInstitution(institution: Institution): Institute {
    const inst = createInstitution(institution.getId());
    return {
        ...inst,
        ...{
            stateShort: institution.getStateShort(),
            name: institution.getName1(),
            addendum: institution.getName2() || '',
            city: institution.getCity() || '',
            zip: institution.getZip() || '',
            phone: institution.getPhone(),
            fax: institution.getFax() || '',
            email: institution.getEmail() || []
        }
    };
}

export function mapToUser(user: ParseUser): User {

    const institution = mapToInstitution(user.getInstitution() as Institution);

    return createUser(
        user.getId(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        institution,
        user.getPassword(),
        user.isEnabled(),
        user.isAdminEnabled(),
        user.getNumAttempt(),
        user.getLastAttempt()
    );
}

export function mapToUserToken(token: Token): UserToken {
    const userId = token.getUser()?.getId();
    return {
        token: token.getToken(),
        type: Number.parseInt(token.getType(), 10),
        userId: userId ? userId : ''
    };
}

export function mapToState(state: ParseState): State {
    const avv = state.getAVV();
    return {
        name: state.getName(),
        short: state.getShort(),
        AVV: avv ? avv : []
    };
}

export function mapToValidationError(
    error: ParseValidationError
): ValidationError {
    return {
        code: error.getCode(),
        level: error.getLevel(),
        message: error.getMessage()
    };
}

export function mapToNRL(nrl: ParseNrl): NRL {
    return {
        id: DefaultNRLService.mapNRLStringToEnum(nrl.getName()),
        selectors: nrl.getSelector() || [],
        email: nrl.getEmail() || '',
        standardProcedures: nrl.getStandardProcedureList().map(p => ({
            value: p.getValue(),
            key: p.getKey()
        })),
        optionalProcedures: nrl.getOptionalProcedureList().map(p => ({
            value: p.getValue(),
            key: p.getKey()
        }))
    };
}

