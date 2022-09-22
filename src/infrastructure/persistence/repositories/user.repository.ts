import { UserRepository, createUser, User } from '../../../app/ports';
import { mapToUser } from './data-mappers';
import {
    PopulatedUserDocument,
    UserDocument
} from '../data-store/mongoose/schemas/user.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { UserNotFoundError, UserUpdateError } from '../model/domain.error';
import { injectable, inject } from 'inversify';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { InstitutionDocument } from '../data-store/mongoose/schemas/institution.schema';

@injectable()
export class DefaultUserRepository
    extends MongooseRepositoryBase<UserDocument>
    implements UserRepository
{
    constructor(
        @inject(PERSISTENCE_TYPES.UserModel) private model: Model<UserDocument>
    ) {
        super(model);
    }

    async findByUserId(id: string): Promise<User> {
        return super
            ._findById(id)
            .then(async doc => {
                if (!doc) return Promise.reject(null);
                return populateWithAuxData(doc);
            })
            .then(doc => {
                if (!doc) {
                    throw new UserNotFoundError(`User not found. id=${id}`);
                }
                return mapToUser(doc);
            })
            .catch(error => {
                throw error;
            });
    }

    async findByUsername(username: string): Promise<User> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: mongoose.trusted({ $regex: nameRegex }) })
            .then(async doc => {
                if (!doc) return Promise.reject(null);
                return populateWithAuxData(doc);
            })
            .then(doc => {
                if (!doc) {
                    throw new UserNotFoundError(
                        `User not found. username=${username}`
                    );
                }
                return mapToUser(doc);
            })
            .catch(error => {
                throw error;
            });
    }

    async getPasswordForUser(username: string): Promise<string> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: mongoose.trusted({ $regex: nameRegex }) })
            .then(doc => {
                if (!doc) {
                    throw new UserNotFoundError(
                        `User not found. username=${username}`
                    );
                }
                return doc.password;
            })
            .catch(error => {
                throw error;
            });
    }

    async hasUserWithEmail(username: string): Promise<boolean> {
        const nameRegex = new RegExp(username, 'i');

        return super
            ._findOne({ email: mongoose.trusted({ $regex: nameRegex }) })
            .then(doc => !!doc);
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
            .then(doc =>
                createUser(
                    doc._id.toHexString(),
                    user.email,
                    user.firstName,
                    user.lastName,
                    user.institution,
                    user.password,
                    doc.enabled,
                    doc.adminEnabled
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
            .then(async doc => {
                if (!doc) {
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

async function populateWithAuxData(
    doc: HydratedDocument<UserDocument>
): Promise<HydratedDocument<PopulatedUserDocument>> {
    return doc.populate<{ institution: InstitutionDocument }>({
        path: 'institution'
    });
}
