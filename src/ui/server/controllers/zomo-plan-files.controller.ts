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
import { ZomoPlanFilesController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';
import { ZomoPlanFileCollectionDTO } from '../model/response.model';

enum ZOMO_PLAN_FILE_ROUTE {
    ROOT = '/zomo-plan-file'
}

interface ParseZomoPlanFileDTO extends ParseEntityDTO {
    zomoPlanFile: ZomoPlanFile;
    readonly year: string;
}

interface ZomoPlanFile {
    __type: string;
    name: string;
    url: string;
}

@controller(API_ROUTE.V2 + ZOMO_PLAN_FILE_ROUTE.ROOT)
export class DefaultZomoPlanFilesController
    extends AbstractController
    implements ZomoPlanFilesController
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
    async getZomoPlanFiles(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getZomoPlanFiles.name}, Request received`
        );

        try {
            const parseResponse = await this.redirectionTarget.get<
                ParseCollectionResponse<ParseZomoPlanFileDTO>,
                AxiosResponse<ParseCollectionResponse<ParseZomoPlanFileDTO>>,
                ParseZomoPlanFileDTO
            >('classes/Zomo_Plan_File');

            const zomoPlanFiles: ParseZomoPlanFileDTO[] =
                parseResponse.data.results;
            const dto: ZomoPlanFileCollectionDTO = { zomoPlanFiles: [] };

            for (let index = 0; index < zomoPlanFiles.length; index++) {
                const element = zomoPlanFiles[index];
                const dtoObj = {
                    url: element.zomoPlanFile.url,
                    year: element.year
                };
                dto.zomoPlanFiles.push(dtoObj);
            }

            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getZomoPlanFiles.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
