import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { NRLsController } from '../model/controller.model';
import { NRLCollectionDTO } from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';

interface ParseNRLDTO extends ParseEntityDTO {
    readonly name: string;
    readonly standardProcedures: ParseAnalysisProceduresDTO[];
    readonly optionalProcedures: ParseAnalysisProceduresDTO[];
}

interface ParseAnalysisProceduresDTO extends ParseEntityDTO {
    readonly value: string;
    readonly key: number;
}

export class DefaultNRLsController
    extends AbstractController
    implements NRLsController
{
    private redirectionTarget: AxiosInstance;
    constructor(configuration: AppServerConfiguration) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }
    async getNRLs(req: Request, res: Response) {
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
