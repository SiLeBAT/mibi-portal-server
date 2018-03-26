import { IRepositoryBase, IUserRepository, createUser, IUser } from './../../../app/ports';
import { UserSchema, IUserModel, IUserModelUpdateResponse, createRepository } from './../dataStore';
import { mapModelToUser } from './dataMappers';

class UserRepository implements IUserRepository {
    constructor(private baseRepo: IRepositoryBase<IUserModel>) {
    }

    getUserById(id: string) {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) {
                    throw new Error(`User not found, id=${id}`);
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
                    throw new Error(`User not found, username=${username}, error=${err}`);
                }
            );
    }

    getPasswordForUser(username: string) {
        return this.baseRepo.findOne({ email: username }).then(
            model => {
                if (!model) {
                    throw new Error(`User not found, username=${username}`);
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

    createUser(user: IUser) {
        const newUser = new UserSchema({
            institution: user.institution.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password
        });
        return this.baseRepo.create(newUser).then(
            model => createUser(model._id.toHexString(), user.email, user.firstName, user.lastName, user.institution, user.password, model.enabled)
        );
    }

    // FIXME: Should also update institutions
    updateUser(user: IUser) {
        return this.baseRepo.update(user.uniqueId, {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            enabled: user.isActivated()
        }).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    throw new Error(`User not found, id=${user.uniqueId}`);
                }
                return this.getUserById(user.uniqueId);
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
