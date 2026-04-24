import {
    Institute,
    User,
    UserToken,
    createInstitution,
    createUser
} from '../../../../app/ports';
import { Institution } from '../../data-store/parse/schema/institution';
import { Token } from '../../data-store/parse/schema/resettoken';
import { User as ParseUser } from '../../data-store/parse/schema/user';

export function mapToInstitution(institution: Institution): Institute {
    const inst = createInstitution(institution.getId() ?? '');
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
        user.getId() ?? '',
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
