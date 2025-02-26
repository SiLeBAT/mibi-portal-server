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
import { ClientDashboardController } from '../model/controller.model';
import { API_ROUTE } from '../model/enums';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import {
    AbstractController,
    ParseCollectionResponse,
    ParseEntityDTO
} from './abstract.controller';

enum CLIENT_DASHBOARD_ROUTE {
    ROOT = '/client-dashboard-info'
}

interface ParseClientDashboardDTO extends ParseEntityDTO {
    readonly name: string;
    readonly isActive: boolean;
}

@controller(API_ROUTE.V2 + CLIENT_DASHBOARD_ROUTE.ROOT)
export class DefaultClientDashboardController
    extends AbstractController
    implements ClientDashboardController
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
    async getDashboardInfo(@request() req: Request, @response() res: Response) {
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
