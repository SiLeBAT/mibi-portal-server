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

enum INSTITUTES_ROUTE {
    ROOT = '/institutes'
}
@controller(API_ROUTE.V2 + INSTITUTES_ROUTE.ROOT)
export class DefaultInstituteController
    extends AbstractController
    implements InstitutesController {
    constructor(
    ) {
        super();
    }

    @httpGet('/')
    async getInstitutes(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getInstitutes.name}, Request received`
        );
        res.redirect(this.parseRedirectionPath + 'institutions')
    }

}
