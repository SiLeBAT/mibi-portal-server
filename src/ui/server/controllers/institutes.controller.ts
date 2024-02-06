import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpGet,
    request,
    response
} from 'inversify-express-utils';
import { logger } from '../../../aspects';
import { InstitutesController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import { AbstractController, ParseEntityDTO, ParseResponse } from './abstract.controller';

enum INSTITUTES_ROUTE {
    ROOT = '/institutes'
}

interface ParseInstitutionDTO extends ParseEntityDTO {
    readonly state_short: string;
    readonly name1: string;
    readonly name2: string;
    readonly city: string;
    readonly zip: string;
    readonly phone: string;
    readonly fax: string;
    readonly email: string[];
}

@controller(API_ROUTE.V2 + INSTITUTES_ROUTE.ROOT)
export class DefaultInstituteController
    extends AbstractController
    implements InstitutesController {

    private redirectionTarget: AxiosInstance;
    constructor(

        @inject(SERVER_TYPES.AppServerConfiguration)
        configuration: AppServerConfiguration

    ) {
        super();

        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }

    @httpGet('/')
    async getInstitutes(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getInstitutes.name}, Request received`
        );

        await this.redirectionTarget.get<ParseResponse<ParseInstitutionDTO>, AxiosResponse<ParseResponse<ParseInstitutionDTO>>, ParseInstitutionDTO>('classes/institutions').then((response) => {
            const institutes: ParseInstitutionDTO[] = response.data.results;

            const instituteDTOCollection = institutes.map(institution => ({
                id: institution.objectId,
                short: institution.state_short,
                name: institution.name1,
                addendum: institution.name2 || '',
                city: institution.city || '',
                zip: institution.zip || '',
                phone: institution.phone,
                fax: institution.fax || '',
                email: institution.email || []
            }));

            this.ok(res, { institutes: instituteDTOCollection });
        }).catch(error => {
            logger.info(
                `${this.constructor.name}.${this.getInstitutes.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        });

    }

    private handleError(res: Response) {
        this.fail(res);
    }

}
