import { Request, Response } from 'express';
import { IInstitutionPort, IController, IInstitution, IAddress } from '../../../app/ports';
import { logger } from '../../../aspects';

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
}

interface IAddressDTO {
    street: string;
    city: string;
}

export interface IInstitutionController extends IController {
    listInstitutions(req: Request, res: Response): void;
}

class InstitutionController implements IInstitutionController {

    constructor(private instiutionService: IInstitutionPort) { }

    async listInstitutions(req: Request, res: Response) {
        let dto;
        await this.instiutionService.retrieveInstitutions().then((institutions) => {
            dto = institutions.map(
                i => this.fromInstitutionEntityToDTO(i)
            );
            res.status(200)
                .json(dto);
        }).catch((err) => {
            logger.error('Unable to retrieve institutions.', { error: err });
            dto = {
                title: 'Error getting all institutions',
                obj: err
            };
            res.status(500).json(dto);
        });

        logger.info('InstitutionController.listInstitutions, Response sent');
        return res.end();
    }

    private fromInstitutionEntityToDTO(inst: IInstitution): IInstitutionDTO {
        return {
            _id: inst.uniqueId,
            short: inst.stateShort,
            name1: inst.name1,
            name2: inst.name2,
            location: inst.location,
            address1: this.fromAddressEntityToDTO(inst.address1),
            address2: this.fromAddressEntityToDTO(inst.address2),
            phone: inst.phone,
            fax: inst.fax,
            email: inst.email
        };
    }

    private fromAddressEntityToDTO(addr: IAddress): IAddressDTO {
        return addr;
    }
}

export function createController(service: IInstitutionPort) {
    return new InstitutionController(service);
}
