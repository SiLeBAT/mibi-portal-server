import { Request, Response } from 'express';
import {
    controller,
    httpGet,
    request,
    response
} from 'inversify-express-utils';
import { logger } from '../../../aspects';
import { InstitutesController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { AbstractController } from './abstract.controller';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { InstituteCollectionDTO } from '../model/response.model';

enum INSTITUTES_ROUTE {
    ROOT = '/institutes'
}

@controller(API_ROUTE.V2 + INSTITUTES_ROUTE.ROOT)
export class DefaultInstituteController
    extends AbstractController
    implements InstitutesController {
    private redirectionTarget: AxiosInstance;

    constructor(
    ) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: "https://mibi-portal.bfr.bund.de"
        });

    }
    @httpGet('/')
    async getInstitutes(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getInstitutes.name}, Request received`
        );

        const institutes = await this.redirectionTarget.get<InstituteCollectionDTO, AxiosResponse<InstituteCollectionDTO>, InstituteCollectionDTO>('/v2/institutes').then((response) => {
            return response.data;
        })
            .catch(error => {
                logger.info(
                    `${this.constructor.name}.${this.getInstitutes.name} has thrown an error. ${error}`
                );
                this.handleError(res);
            });
        this.ok(res, institutes);
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
