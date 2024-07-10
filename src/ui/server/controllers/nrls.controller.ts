import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import {
    controller,
    httpGet,
    request,
    response
} from 'inversify-express-utils';
import { logger } from '../../../aspects';
import { NRLsController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { NRLCollectionDTO } from '../model/response.model';
import { RedirectionController } from './redirection.controller';

enum NRL_ROUTE {
    ROOT = '/nrls'
}
@controller(API_ROUTE.V2 + NRL_ROUTE.ROOT)
export class DefaultNRLsController
    extends RedirectionController
    implements NRLsController {
    @httpGet('/')
    async getNRLs(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getNRLs.name}, Request received`
        );
        const nrls = await this.redirectionTarget.get<NRLCollectionDTO, AxiosResponse<NRLCollectionDTO>, NRLCollectionDTO>(NRL_ROUTE.ROOT).then((response) => {
            return response.data;
        })
            .catch(error => {
                logger.info(
                    `${this.constructor.name}.${this.getNRLs.name} has thrown an error. ${error}`
                );
                this.handleError(res);
            });
        this.ok(res, nrls);
    }

    private handleError(res: Response) {
        this.fail(res);
    }

}
