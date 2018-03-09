import { Request, Response, NextFunction } from 'express';
import { retrieveInstitutions } from '../interactors';
import { IInstitutionEntity, IAddress } from './../../shared/entities';

interface IInstitutionDTO {
    _id: string;
    short: string;
    name1: string;
    name2: string;
    location: string;
    address1: IAddressDTO;
    address2: IAddressDTO;
    phone: string;
    fax: string;
    email: string[];
    state_id: string;
}

interface IAddressDTO {
    street: string;
    city: string;
}

function listInstitutions(req: Request, res: Response, next: NextFunction) {

    retrieveInstitutions().then((institutions) => {
        const dto = institutions.map(
            i => fromInstitutionEntityToDTO(i)
        );
        res
            .status(200)
            .json(dto);
    })
        .catch((err) => {

            res
                .json({
                    title: 'Error getting all institutions',
                    obj: err
                });

        });
}

function fromInstitutionEntityToDTO(inst: IInstitutionEntity): IInstitutionDTO {
    return {
        _id: inst.uniqueId,
        short: inst.short,
        name1: inst.name1,
        name2: inst.name2,
        location: inst.location,
        address1: fromAddressEntityToDTO(inst.address1),
        address2: fromAddressEntityToDTO(inst.address2),
        phone: inst.phone,
        fax: inst.fax,
        email: inst.email,
        state_id: inst.stateId
    };
}

function fromAddressEntityToDTO(addr: IAddress): IAddressDTO {
    return addr;
}

export {
    listInstitutions
};
