import { createUser, IUserEntity, IUserRepository, IUserModelAttributes, IRepositoryBase } from './../../../server';
import { InvalidUserError } from './../../../aspects';
import { UserSchema, IUserModel, IUserModelUpdateResponse, createRepository } from './../dataStore';
import { mapModelToUser } from './dataMappers';

class UserRepository implements IUserRepository {
    constructor(private baseRepo: IRepositoryBase<IUserModel>) {
    }

    getUserById(id: string) {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) {
                    throw new InvalidUserError(`User not found, id=${id}`);
                }
                return mapModelToUser(m);
            }
        );
    }

    findByUsername(username: string) {
        return this.baseRepo.findOne({ email: username })
            .then(
                populateWithAuxData
            )
            .then(
                (user: IUserModel) => {
                    return mapModelToUser(user);
                }
            ).
            catch(
                (err) => {
                    throw new InvalidUserError(`User not found, username=${username}, error=${err}`);
                }
            );
    }

    getPasswordForUser(username: string) {
        return this.baseRepo.findOne({ email: username }).then(
            model => {
                if (!model) {
                    throw new InvalidUserError(`User not found, username=${username}`);
                }
                return model.password;
            }
        );
    }

    hasUser(username: string) {
        return this.baseRepo.findOne({ email: username }).then(
            docs => !!docs
        );
    }

    createUser(user: IUserEntity) {
        const newUser = new UserSchema({
            institution: user.institution.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
        });
        return this.baseRepo.create(newUser).then(
            user => createUser(user._id.toHexString(), user.email, user.firstName, user.lastName, user.institution, user.password, user.enabled)
        );
    }

    updateUser(userId: string, data: IUserModelAttributes) {
        return this.baseRepo.update(userId, data).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    throw new InvalidUserError(`User not found, id=${userId}`);
                }
                return this.getUserById(userId);
            }
        );
    }

}

function populateWithAuxData(model: IUserModel): Promise<IUserModel> {
    // For some reason .populate does not return a promise and only works with callback: although the docs promise otherwise.
    return new Promise(function (resolve, reject) {
        model.populate({ path: 'institution' }, function (err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });

}
export const repository: IUserRepository = new UserRepository(createRepository(UserSchema));
