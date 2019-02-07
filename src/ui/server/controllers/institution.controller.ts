import { Request, Response } from 'express';
import { InstitutionPort, IController, Institute } from '../../../app/ports';
import { logger } from '../../../aspects';

interface IInstitutionDTO {
    _id: string;
    short: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];
}

export interface IInstitutionController extends IController {
    listInstitutions(req: Request, res: Response): void;
}

class InstitutionController implements IInstitutionController {
    constructor(private instiutionService: InstitutionPort) {}

    async listInstitutions(req: Request, res: Response) {
        let dto;
        await this.instiutionService
            .retrieveInstitutes()
            .then((institutions: Institute[]) => {
                dto = institutions.map(i => this.fromInstitutionEntityToDTO(i));
                res.status(200).json(dto);
            })
            .catch((err: Error) => {
                logger.error(`Unable to retrieve institutions. error=${err}`);
                dto = {
                    title: 'Error getting all institutions',
                    obj: err
                };
                res.status(500).json(dto);
            });

        logger.info('InstitutionController.listInstitutions, Response sent');
        return res.end();
    }

    private fromInstitutionEntityToDTO(inst: Institute): IInstitutionDTO {
        return {
            _id: inst.uniqueId,
            short: inst.stateShort,
            name: inst.name,
            addendum: inst.addendum,
            city: inst.city,
            zip: inst.zip,
            phone: inst.phone,
            fax: inst.fax,
            email: inst.email
        };
    }
}

export function createController(service: InstitutionPort) {
    return new InstitutionController(service);
}
