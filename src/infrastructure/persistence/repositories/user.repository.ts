import { UserRepository, createUser, User } from '../../../app/ports';

import { mapModelToUser } from './data-mappers';
import { UserModel } from '../data-store/mongoose/schemas/user.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { UserNotFoundError, UserUpdateError } from '../model/domain.error';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';

@injectable()
export class DefaultUserRepository
    extends MongooseRepositoryBase<UserModel>
    implements UserRepository
{
    constructor(
        @inject(PERSISTENCE_TYPES.UserModel) private model: Model<UserModel>
    ) {
        super(model);
    }

    async findByUserId(id: string): Promise<User> {
        return super
            ._findById(id)
            .then(async (userModel: UserModel) => {
                if (!userModel) return Promise.reject(null);
                return populateWithAuxData(userModel);
            })
            .then((userModel: UserModel) => {
                if (!userModel) {
                    throw new UserNotFoundError(`User not found. id=${id}`);
                }
                return mapModelToUser(userModel);
            })
            .catch(error => {
                throw error;
            });
    }

    async findByUsername(username: string): Promise<User> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: { $regex: nameRegex } })
            .then(async (userModel: UserModel) => {
                if (!userModel) return Promise.reject(null);
                return populateWithAuxData(userModel);
            })
            .then((userModel: UserModel) => {
                if (!userModel) {
                    throw new UserNotFoundError(
                        `User not found. username=${username}`
                    );
                }
                return mapModelToUser(userModel);
            })
            .catch(error => {
                throw error;
            });
    }

    async getPasswordForUser(username: string): Promise<string> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: { $regex: nameRegex } })
            .then((userModel: UserModel) => {
                if (!userModel) {
                    throw new UserNotFoundError(
                        `User not found. username=${username}`
                    );
                }
                return userModel.password;
            })
            .catch(error => {
                throw error;
            });
    }

    async hasUserWithEmail(username: string): Promise<boolean> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: { $regex: nameRegex } })
            .then(docs => !!docs);
    }

    async createUser(user: User): Promise<User> {
        const newUser = new this.model({
            institution: user.institution.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
        });
        return super
            ._create(newUser)
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
            .catch(error => {
                throw error;
            });
    }

    async updateUser(user: User): Promise<User> {
        return super
            ._update(user.uniqueId, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password,
                enabled: user.isVerified(),
                adminEnabled: user.isActivated(),
                numAttempt: user.getNumberOfFailedAttempts(),
                lastAttempt: user.getLastLoginAttempt()
            })
            .then(async response => {
                if (!response) {
                    throw new UserUpdateError(
                        `Response not OK. Unable to update user.`
                    );
                }
                return this.findByUserId(user.uniqueId);
            })
            .catch(error => {
                throw error;
            });
    }
}

async function populateWithAuxData(model: UserModel): Promise<UserModel> {
    // For some reason .populate does not return a promise and only works with callback: although the docs promise otherwise.
    return new Promise(function (resolve, reject) {
        model.populate({ path: 'institution' }, function (err, data) {
            if (err !== null) {
                reject(err);
            }
            resolve(data);
        });
    });
}
