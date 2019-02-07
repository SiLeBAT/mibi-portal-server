import {
    RepositoryBase,
    UserRepository,
    createUser,
    User
} from '../../../app/ports';
import {
    UserSchema,
    IUserModel,
    IUserModelUpdateResponse,
    createRepository
} from '../data-store';
import { mapModelToUser } from './data-mappers';
import {
    ApplicationDomainError,
    ApplicationSystemError
} from '../../../app/sharedKernel';

class DefaultUserRepository implements UserRepository {
    constructor(private baseRepo: RepositoryBase<IUserModel>) {}

    findById(id: string) {
        return this.baseRepo
            .findById(id)
            .then((userModel: IUserModel) => {
                if (!userModel) {
                    throw new ApplicationDomainError(
                        `User not found. id=${id}`
                    );
                }
                return mapModelToUser(userModel);
            })
            .catch(error => {
                throw new ApplicationDomainError(
                    `User not found. userId=${id}; error=${error}`
                );
            });
    }

    findByUsername(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo
            .findOne({ email: { $regex: nameRegex } })
            .then((userModel: IUserModel) => {
                if (!userModel) return Promise.reject(null);
                return populateWithAuxData(userModel);
            })
            .then((userModel: IUserModel) => {
                if (!userModel) {
                    throw new ApplicationDomainError(
                        `User not found. username=${username}`
                    );
                }
                return mapModelToUser(userModel);
            })
            .catch(() => {
                throw new ApplicationDomainError(
                    `User not found. username=${username}`
                );
            });
    }

    getPasswordForUser(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo
            .findOne({ email: { $regex: nameRegex } })
            .then((userModel: IUserModel) => {
                if (!userModel) {
                    throw new ApplicationDomainError(
                        `User not found. username=${username}`
                    );
                }
                return userModel.password;
            })
            .catch(() => {
                throw new ApplicationDomainError(
                    `User not found. username=${username}`
                );
            });
    }

    hasUser(username: string) {
        const nameRegex = new RegExp(username, 'i');

        return this.baseRepo
            .findOne({ email: { $regex: nameRegex } })
            .then(docs => !!docs);
    }

    createUser(user: User) {
        const newUser = new UserSchema({
            institution: user.institution.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
        });
        return this.baseRepo
            .create(newUser)
            .then(model =>
                createUser(
                    model._id.toHexString(),
                    user.email,
                    user.firstName,
                    user.lastName,
                    user.institution,
                    user.password,
                    model.enabled,
                    model.adminEnabled
                )
            )
            .catch(() => {
                throw new ApplicationSystemError(
                    `Unable to create user. user=${user}`
                );
            });
    }

    updateUser(user: User) {
        return this.baseRepo
            .update(user.uniqueId, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                enabled: user.isActivated(),
                adminEnabled: user.isAdminActivated(),
                numAttempt: user.getNumberOfFailedAttempts(),
                lastAttempt: user.getLastLoginAttempt()
            })
            .then((response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    throw new ApplicationSystemError(
                        `Response not OK. Unable to update user. user=${user}`
                    );
                }
                return this.findById(user.uniqueId);
            })
            .catch(error => {
                throw new ApplicationSystemError(
                    `Unable to update user. user=${user}; error=${error}`
                );
            });
    }
}

function populateWithAuxData(model: IUserModel): Promise<IUserModel> {
    // For some reason .populate does not return a promise and only works with callback: although the docs promise otherwise.
    return new Promise(function(resolve, reject) {
        model.populate({ path: 'institution' }, function(err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });
}

export const repository: UserRepository = new DefaultUserRepository(
    createRepository(UserSchema)
);
