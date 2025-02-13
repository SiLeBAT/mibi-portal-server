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
import { NRLsController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { NRLCollectionDTO } from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';

enum NRL_ROUTE {
    ROOT = '/nrls'
}

interface ParseNRLDTO extends ParseEntityDTO {
    readonly name: string;
    readonly standardProcedures: ParseAnalysisProceduresDTO[];
    readonly optionalProcedures: ParseAnalysisProceduresDTO[];
}

interface ParseAnalysisProceduresDTO extends ParseEntityDTO {
    readonly value: string;
    readonly key: number;
}

@controller(API_ROUTE.V2 + NRL_ROUTE.ROOT)
export class DefaultNRLsController
    extends AbstractController
    implements NRLsController
{
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
    async getNRLs(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getNRLs.name}, Request received`
        );

        try {
            const params = {
                params: {
                    include: ['standardProcedures', 'optionalProcedures']
                }
            };

            const parseResponse = await this.redirectionTarget.get<
                ParseCollectionResponse<ParseNRLDTO>,
                AxiosResponse<ParseCollectionResponse<ParseNRLDTO>>,
                ParseNRLDTO
            >('classes/NRL', params);

            const nrls: ParseNRLDTO[] = parseResponse.data.results;

            const dto: NRLCollectionDTO = { nrls: [] };
            for (let index = 0; index < nrls.length; index++) {
                const element = nrls[index];

                dto.nrls.push({
                    id: element.name,
                    standardProcedures: element.standardProcedures.map(
                        procedure => ({
                            value: procedure.value,
                            key: procedure.key
                        })
                    ),
                    optionalProcedures: element.optionalProcedures.map(
                        procedure => ({
                            value: procedure.value,
                            key: procedure.key
                        })
                    )
                });
            }

            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getNRLs.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
