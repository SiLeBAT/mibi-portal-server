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
import { OrdersController } from '../model/controller.model';
import { TokenNotFoundError } from '../model/domain.error';
import { API_ROUTE } from '../model/enums';
import { RedirectedCreateOrderListRequestDTO } from '../model/request.model';
import { OrderCollectionDTO } from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import { AbstractController, ParseSingleResponse } from './abstract.controller';

import { APPLICATION_TYPES } from '../../../app/application.types';
import {
    TokenPayload,
    TokenPort
} from '../../../app/authentication/model/token.model';
import { User, UserPort } from '../../../app/authentication/model/user.model';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';

enum ORDER_ROUTE {
    ROOT = '/orders'
}

@controller(API_ROUTE.V2 + ORDER_ROUTE.ROOT)
export class DefaultOrdersController
    extends AbstractController
    implements OrdersController
{
    // @ts-ignore
    private redirectionTarget: AxiosInstance;
    constructor(
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort,
        @inject(APPLICATION_TYPES.UserService) private userService: UserPort,
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
    async getOrders(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getOrders.name}, Request received`
        );

        try {
            const token = getTokenFromHeader(req);
            if (!token) {
                throw new TokenNotFoundError('Invalid user.');
            }
            const user: User = await this.getUserFromToken(token);

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderCollectionDTO>,
                AxiosResponse<ParseSingleResponse<OrderCollectionDTO>>,
                RedirectedCreateOrderListRequestDTO
            >('functions/createOrderList', {
                userEmail: user.email
            });

            logger.info(
                `${this.constructor.name}.${this.getOrders.name}, Response sent`
            );
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getOrders.name} has thrown an error. ${error}`
            );
            this.handleError(res);
        }
    }

    private handleError(res: Response) {
        this.fail(res);
    }

    private async getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }
}
