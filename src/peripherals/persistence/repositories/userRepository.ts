import { IRepositoryBase } from './../../../server/core';
import { createUser, IUserEntity, IUserdata } from './../../../server/userManagement/shared/entities';
import { InvalidUserError, logger, InvalidOperationError } from './../../../aspects';
import { UserSchema, IUserModel, IUserModelUpdateResponse, IUserdataModel, createRepository } from './../dataStore';
import { IUserRepository, IUserModelAttributes } from './../../../server/userManagement/shared/interactors';
import { mapModelToUser, mapModelToUserdata } from './dataMappers';

class UserRepository implements IUserRepository {
    constructor(private baseRepo: IRepositoryBase<IUserModel>) {
    }

    getUserById(id: string) {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) {
                    logger.error('User not found');
                    throw new InvalidUserError('User not found');
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
                    const userExt = mapModelToUser(user);
                    userExt.userdata = user.userdata;
                    return userExt;
                }
            ).
            catch(
                (err) => {
                    logger.info('User not found: ', username);
                    throw new InvalidUserError(err);
                }
            );
    }

    getPasswordForUser(username: string) {
        return this.baseRepo.findOne({ email: username }).then(
            model => {
                if (!model) {
                    logger.error('User not found');
                    throw new InvalidUserError('User not found');
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
            user => createUser(user._id.toHexString(), user.email, user.firstName, user.lastName, user.institution, user.enabled)
        );
    }

    updateUser(userId: string, data: IUserModelAttributes) {
        return this.baseRepo.update(userId, data).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    logger.error('User not found');
                    throw new InvalidUserError('User not found');
                }
                return this.getUserById(userId);
            }
        );
    }

    addDataToUser(userId: string, userdata: IUserdata) {
        return this.baseRepo.update(userId, { userdata: userdata.uniqueId }).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    logger.error('User not found');
                    throw new InvalidUserError('User not found');
                }
                return this.baseRepo.findById(userId)
                    .then(
                        populateWithAuxData
                    ).then(
                        m => {
                            const u = mapModelToUser(m);
                            u.userdata = m.userdata.map((ud: IUserdataModel) => mapModelToUserdata(ud));
                            return u;
                        }
                    );
            }
        );
    }

    deleteDataFromUser(userId: string, userdataId: string) {
        return this.baseRepo.update(userId, { $pull: { userdata: userdataId } }).then(
            (response: IUserModelUpdateResponse) => {
                if (!response.ok) {
                    logger.error('User not found');
                    throw new InvalidUserError('User not found');
                }
                return this.baseRepo.findById(userId)
                    .then(
                        populateWithAuxData
                    ).then(
                        m => {
                            const u = mapModelToUser(m);
                            u.userdata = m.userdata.map((ud: IUserdataModel) => mapModelToUserdata(ud));
                            return u;
                        }
                    );
            }
        );
    }
}

function populateWithAuxData(model: IUserModel): Promise<IUserModel> {
    // For some reason .populate does not return a promise and only works with callback: although the docs promise otherwise.
    return new Promise(function (resolve, reject) {
        model.populate({ path: 'institution userdata' }, function (err, data) {
            if (err !== null) return reject(err);
            resolve(data);
        });
    });

}
export const repository: IUserRepository = new UserRepository(createRepository(UserSchema));
