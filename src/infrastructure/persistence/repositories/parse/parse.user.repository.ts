import { injectable } from 'inversify';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import { User as ParseUser, SCHEMA_FIELDS as USER_FIELDS } from '../../data-store/parse/schema/user';
import { Institution, SCHEMA_FIELDS as INSTITUTION_FIELDS } from '../../data-store/parse/schema/institution';
import { ParseUserRepository, createUser, User } from '../../../../app/ports';
import {
    UserNotFoundError,
    UserUpdateError
} from '../../model/domain.error';
import { mapToUser } from './data-mappers';

@injectable()
export class ParseDefaultUserRepository
    extends ParseRepositoryBase<ParseUser>
    implements ParseUserRepository
{

    constructor() {
        super();
        super.setClassName(USER_FIELDS.className);
    }

    async hasUserWithEmail(username: string): Promise<boolean> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._matches(USER_FIELDS.email, nameRegex, 'i')
            .then((user: ParseUser) => !!user);
    }

    async createUser(user: User): Promise<User> {
        const institution: Institution = await super._findById(user.institution.uniqueId, INSTITUTION_FIELDS.className) as Institution;

        const newUser = new ParseUser({
            institution: institution,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            lastAttempt: Date.now()
        });
        return super
            ._create(newUser)
            .then(async (savedUser: ParseUser) =>
                createUser(
                    savedUser.getId(),
                    user.email,
                    user.firstName,
                    user.lastName,
                    user.institution,
                    user.password,
                    savedUser.isEnabled(),
                    savedUser.isAdminEnabled()
                )
            )
            .catch(error => {
                throw error;
            });
    }

    async findByUserId(id: string): Promise<User> {
        return super
            ._findById(id, undefined, true)
            .then(async (user: ParseUser) => {
                if (!user) {
                    return Promise.reject(null);
                }
                const institution = user.getInstitution();
                if (!institution) {
                    return super._retrieveIncludingWith([USER_FIELDS.institution], USER_FIELDS.email, user.getEmail());
                }
                return user;
            })
            .then(async (user: ParseUser) => {
                if (!user) {
                    throw new UserNotFoundError(`User not found. id=${id}`);
                }
                return mapToUser(user);
            })
            .catch(error => {
                throw error;
            });
    }

    async updateUser(user: User): Promise<User> {

        const updatedUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            enabled: user.isVerified(),
            adminEnabled: user.isActivated(),
            numAttempt: user.getNumberOfFailedAttempts(),
            lastAttempt: user.getLastLoginAttempt()
        };

        return super._findById(user.uniqueId)
            .then(async (parseUser: ParseUser) => {
                if (!parseUser) {
                    throw new UserNotFoundError(`User not found. id=${user.uniqueId}`);
                }

                return super._update(parseUser, updatedUser);
            })
            .then(async (parseUser: ParseUser) => {
                if (!parseUser) {
                    throw new UserUpdateError(` Updated user not found. id=${user.uniqueId}`);
                }

                return mapToUser(parseUser);
            })
            .catch(error => {
                throw error;
            });
    }

    async findByUsername(username: string): Promise<User> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._matches(USER_FIELDS.email, nameRegex, 'i')
            .then(async parseUser => {
                if (!parseUser) {
                    return Promise.reject(null);
                }
                const institution = parseUser.getInstitution();
                if (!institution) {
                    return super._retrieveIncludingWith([USER_FIELDS.institution], USER_FIELDS.email, parseUser.getEmail());
                }
                return parseUser;
            })
            .then(async parseUser => {
                if (!parseUser) {
                    throw new UserNotFoundError(`User not found. username=${username}`);
                }
                if (Array.isArray(parseUser) && parseUser.length > 0) {
                    return mapToUser(parseUser[0]);
                }
                return mapToUser(parseUser as ParseUser);
            })
            .catch(error => {
                throw error;
            });
    }

    async getPasswordForUser(username: string): Promise<string> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._matches(USER_FIELDS.email, nameRegex, 'i')
            .then(async parseUser => {
                if (!parseUser) {
                    throw new UserNotFoundError(
                        `User not found. username=${username}`
                    );
                }
                return parseUser.getPassword();
            })
            .catch(error => {
                throw error;
            });
    }
}
