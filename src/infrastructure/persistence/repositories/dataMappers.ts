import { IInstitution, createInstitution, createUser, IUser, IState } from './../../../app/ports';
import { IInstitutionModel } from '../dataStore';
import { IUserModel } from './../dataStore';
import { IStateModel } from '../dataStore/mongoose/schemas/state.schema';

function mapModelToInstitution(i: IInstitutionModel): IInstitution {
    const inst = createInstitution(i._id);
    return {
        ...inst, ...{
            stateShort: i.state_short,
            name1: i.name1,
            name2: i.name2,
            location: i.location,
            address1: i.address1,
            address2: i.address2,
            phone: i.phone,
            fax: i.fax,
            email: i.email
        }
    };
}

function mapModelToUser(model: IUserModel): IUser {
    // tslint:disable-next-line:no-any
    const institution = mapModelToInstitution(model.institution);
    return createUser(model._id.toHexString(),
        model.email,
        model.firstName,
        model.lastName,
        institution,
        model.password,
        model.enabled,
        model.adminEnabled,
        model.numAttempt,
        model.lastAttempt);
}

function mapModelToState(model: IStateModel): IState {
    return {
        name: model.name,
        short: model.short,
        AVV: model.AVV
    };
}

export {
    mapModelToInstitution,
    mapModelToUser,
    mapModelToState
};
