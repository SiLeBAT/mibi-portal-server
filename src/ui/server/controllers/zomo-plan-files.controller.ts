import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpGet,
    httpPut,
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
import {
    ZomoPlanFileCollectionDTO,
    ZomoPlanFileInfoDTO,
    DefaultServerErrorDTO
} from '../model/response.model';

enum ZOMO_PLAN_FILE_ROUTE {
    ROOT = '/zomo-plan-file',
    DOWNLOAD = '/download'
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
    async getZomoPlanFileInfo(
        @request() req: Request,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.getZomoPlanFileInfo.name}, Request received`
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

                const dtoObj: ZomoPlanFileInfoDTO = {
                    id: element.objectId,
                    year: element.year
                };
                dto.zomoPlanFiles.push(dtoObj);
            }

            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getZomoPlanFileInfo.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    @httpPut(ZOMO_PLAN_FILE_ROUTE.DOWNLOAD)
    async downloadZomoPlanFile(
        @request() req: Request,
        @response() res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.downloadZomoPlanFile.name}, Request received`
        );

        try {
            const requestDTO: ZomoPlanFileInfoDTO = req.body;
            const parseResponse = await this.redirectionTarget.get<
                ParseCollectionResponse<ParseZomoPlanFileDTO>
            >('classes/Zomo_Plan_File', {
                params: {
                    where: JSON.stringify({
                        objectId: requestDTO.id
                    })
                }
            });
            const results = parseResponse.data.results;

            if (!results || results.length === 0) {
                const error: DefaultServerErrorDTO = {
                    code: 4,
                    message: `No Zomo Plan File found for id ${requestDTO.id}`
                };
                this.axiosError(res, error);
            }

            const zomoPlanFileEntry = results[0];
            const fileUrl = zomoPlanFileEntry.zomoPlanFile.url;
            const fileName = zomoPlanFileEntry.zomoPlanFile.name;
            const fileResponse = await axios.get(fileUrl, {
                responseType: 'stream'
            });
            const contentType =
                fileResponse.headers['content-type'] ||
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            res.setHeader('Content-Type', contentType);
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodeURIComponent(fileName)}"`
            );

            if (fileResponse.headers['content-length']) {
                res.setHeader(
                    'Content-Length',
                    fileResponse.headers['content-length']
                );
            }

            await new Promise<void>((resolve, reject) => {
                fileResponse.data.pipe(res);

                fileResponse.data.on('end', () => {
                    resolve();
                });
                fileResponse.data.on('error', (err: Error) => {
                    reject(err);
                });
                res.on('error', (err: Error) => {
                    reject(err);
                });
            });
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.downloadZomoPlanFile.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
