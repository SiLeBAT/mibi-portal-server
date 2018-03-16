import { IInstitutionEntity, createInstitution, createUser, IUserEntity } from './../../../server';
import { IInstitutionModel } from '../dataStore';
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
    return createUser(model._id.toHexString(), model.email, model.firstName, model.lastName, institution, model.password, model.enabled);
}

export {
    mapModelToInstitution,
    mapModelToUser
};
