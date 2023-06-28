import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpGet,
    request,
    response
} from 'inversify-express-utils';
import { Institute, InstitutePort } from '../../../app/ports';
import { logger } from '../../../aspects';
import { InstitutesController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { InstituteCollectionDTO, InstituteDTO } from '../model/response.model';
import { APPLICATION_TYPES } from './../../../app/application.types';
import { AbstractController } from './abstract.controller';

enum INSTITUTES_ROUTE {
    ROOT = '/institutes'
}
@controller(API_ROUTE.V2 + INSTITUTES_ROUTE.ROOT)
export class DefaultInstituteController
    extends AbstractController
    implements InstitutesController {
    constructor(
        @inject(APPLICATION_TYPES.InstituteService)
        private instituteService: InstitutePort
    ) {
        super();
    }

    @httpGet('/')
    async getInstitutes(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getInstitutes.name}, Request received`
        );
        await this.instituteService
            .retrieveInstitutes()
            .then((institutions: Institute[]) => {
                const institutes: InstituteDTO[] = institutions.map(i =>
                    this.fromInstituteEntityToDTO(i)
                );
                const dto: InstituteCollectionDTO = { institutes };
                logger.info(
                    `${this.constructor.name}.${this.getInstitutes.name}, Response sent`
                );
                this.ok(res, dto);
            })
            .catch(error => {
                logger.info(
                    `${this.constructor.name}.${this.getInstitutes.name} has thrown an error. ${error}`
                );
                this.handleError(res);
            });
    }

    private handleError(res: Response) {
        this.fail(res);
    }

    private fromInstituteEntityToDTO(inst: Institute): InstituteDTO {
        return {
            id: inst.uniqueId,
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
