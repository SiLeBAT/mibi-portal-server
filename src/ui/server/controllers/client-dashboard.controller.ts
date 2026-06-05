import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { ClientDashboardController } from '../model/controller.model';
import { AppServerConfiguration } from '../ports';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';

interface ParseClientDashboardDTO extends ParseEntityDTO {
    readonly name: string;
    readonly isActive: boolean;
}

export class DefaultClientDashboardController
    extends AbstractController
    implements ClientDashboardController
{
    private redirectionTarget: AxiosInstance;
    constructor(configuration: AppServerConfiguration) {
        super();

        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }

    async getDashboardInfo(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getDashboardInfo.name}, Request received`
        );

        try {
            const parseResponse = await this.redirectionTarget.get<
                ParseCollectionResponse<ParseClientDashboardDTO>,
                AxiosResponse<ParseCollectionResponse<ParseClientDashboardDTO>>,
                ParseClientDashboardDTO
            >('classes/Client_Dashboard');

            const clientDashboardInfos: ParseClientDashboardDTO[] =
                parseResponse.data.results;

            const dto =
                clientDashboardInfos.length > 0
                    ? {
                          name: clientDashboardInfos[0].name,
                          isActive: clientDashboardInfos[0].isActive
                      }
                    : { name: 'Alternative welcome page', isActive: false };

            this.ok(res, { clientDashboardInfo: dto });
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getDashboardInfo.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }
}
