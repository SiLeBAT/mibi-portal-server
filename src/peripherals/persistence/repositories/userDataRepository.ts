import { IRepositoryBase } from './../../../server/core';
import { IUserdata } from './../../../server/userManagement/shared/entities';
import { logger, ServerError } from './../../../aspects';
import { UserdataSchema, createRepository, IUserdataModel } from './../dataStore';
import { IUserdataRepository } from './../../../server/userManagement/shared/interactors';
import { mapModelToUserdata } from './dataMappers';

class UserDataRepository implements IUserdataRepository {

    constructor(private baseRepo: IRepositoryBase<IUserdataModel>) {
    }

    saveUserdata(userdata: IUserdata): Promise<IUserdata> {
        const newUserdata = new UserdataSchema(userdata);
        return this.baseRepo.create(newUserdata).then(
            res => mapModelToUserdata(res)
        );
    }

    updateUserData(id: string, userdata: IUserdata): Promise<boolean> {
        return this.baseRepo.findById(id).then(
            model => {
                if (!model) {
                    logger.error('Userdata not found');
                    throw new ServerError('Userdata not found');
                }
                const newModel = new UserdataSchema(userdata);
                return !!this.baseRepo.update(model._id, new UserdataSchema(userdata));
            }
        );
    }

    deleteUserData(id: string): Promise<boolean> {
        return this.baseRepo.findById(id).then(
            model => {
                if (!model) {
                    logger.error('Userdata not found');
                    throw new ServerError('Userdata not found');
                }
                return !!this.baseRepo.delete(model._id);
            }
        );
    }
}
export const repository: IUserdataRepository = new UserDataRepository(createRepository(UserdataSchema));
