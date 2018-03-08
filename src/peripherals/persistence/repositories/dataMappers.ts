import { IInstitutionEntity, createInstitution, createUser, IUserEntity, IUserdata } from './../../../server/userManagement/shared/entities';
import { InvalidOperationError, logger, ServerError } from './../../../aspects';
import { IInstitutionModel, IUserdataModel } from '../dataStore';
import { IUserModel } from './../dataStore';

function mapModelToInstitution(i: IInstitutionModel): IInstitutionEntity {
    const inst = createInstitution(i._id);
    return {
        ...inst, ...{
            short: i.short,
            name1: i.name1,
            name2: i.name2,
            location: i.location,
            address1: i.address1,
            address2: i.address2,
            phone: i.phone,
            fax: i.fax,
            email: i.email,
            stateId: i.stateId
        }
    };
}

function mapModelToUser(model: IUserModel): IUserEntity {
    const institution = mapModelToInstitution((model.institution as IInstitutionModel));
    return createUser(model._id.toHexString(), model.email, model.firstName, model.lastName, institution, model.enabled);
}

function mapModelToUserdata(model: IUserdataModel): IUserdata {
    return {
        uniqueId: model._id.toHexString(),
        department: model.department,
        contact: model.contact,
        phone: model.phone,
        email: model.email
    };
}

export {
    mapModelToInstitution,
    mapModelToUser,
    mapModelToUserdata
};
