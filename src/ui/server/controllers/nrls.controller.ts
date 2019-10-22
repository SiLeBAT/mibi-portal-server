import { Request, Response } from 'express';
import { NRLPort, NRL } from '../../../app/ports';
import { logger } from '../../../aspects';
import { NRLsController } from '../model/controller.model';
import { NRLDTO, NRLCollectionDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';
import {
    controller,
    httpGet,
    request,
    response
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { ROUTE } from '../model/enums';
import { APPLICATION_TYPES } from '../../../app/application.types';

enum NRL_ROUTE {
    ROOT = '/nrls'
}
@controller(ROUTE.VERSION + NRL_ROUTE.ROOT)
export class DefaultNRLsController extends AbstractController
    implements NRLsController {
    constructor(
        @inject(APPLICATION_TYPES.NRLService)
        private nrlService: NRLPort
    ) {
        super();
    }
    @httpGet('/')
    async getNRLs(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getNRLs.name}, Request received`
        );
        await this.nrlService
            .retrieveNRLs()
            .then((nrls: NRL[]) => {
                const nrlDTOs: NRLDTO[] = nrls.map(i => this.fromNRLToDTO(i));
                const dto: NRLCollectionDTO = { nrls: nrlDTOs };
                logger.info(
                    `${this.constructor.name}.${
                        this.getNRLs.name
                    }, Response sent`
                );
                this.ok(res, dto);
            })
            .catch(error => {
                logger.info(
                    `${this.constructor.name}.${
                        this.getNRLs.name
                    } has thrown an error. ${error}`
                );
                this.handleError(res);
            });
    }

    private handleError(res: Response) {
        this.fail(res);
    }

    private fromNRLToDTO({
        id,
        standardProcedures,
        optionalProcedures
    }: NRL): NRLDTO {
        return {
            id,
            standardProcedures,
            optionalProcedures
        };
    }
}
