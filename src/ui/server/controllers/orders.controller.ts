import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { OrdersController } from '../model/controller.model';
import { SERVER_ERROR_CODE } from '../model/enums';
import { RedirectedCreateOrderListRequestDTO } from '../model/request.model';
import { OrderCollectionDTO } from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import { AbstractController, ParseSingleResponse } from './abstract.controller';
import {
    TokenPayload,
    TokenPort
} from '../../../app/authentication/model/token.model';
import { User, UserPort } from '../../../app/authentication/model/user.model';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import '../middleware/session.augment';

export class DefaultOrdersController
    extends AbstractController
    implements OrdersController
{
    private redirectionTarget!: AxiosInstance;
    constructor(
        private tokenService: TokenPort,
        private userService: UserPort,
        configuration: AppServerConfiguration
    ) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }
    async getOrders(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getOrders.name}, Request received`
        );

        try {
           const token = getTokenFromHeader(req);
            if (!token) {
                this.unauthorized(res, {
                    code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                    message: 'Not authenticated'
                });
                return;
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
            this.fail(res);
        }
    }

    private async getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }

}
