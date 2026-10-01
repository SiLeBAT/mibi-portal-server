import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { OrdersController } from '../model/controller.model';
import { SERVER_ERROR_CODE } from '../model/enums';
import {
    RedirectedCreateOrderListRequestDTO,
    RedirectedDeleteOrdersRequestDTO,
    RedirectedGetSamplesWithResultsRequestDTO,
    RedirectedStoreResultsRequestDTO,
    StoreResultsRequestDTO
} from '../model/request.model';
import {
    DefaultServerErrorDTO,
    OrderCollectionDTO,
    OrderDeletionResultDTO,
    SamplesWithResultsCollectionDTO,
    StoreResultsCollectionDTO
} from '../model/response.model';
import { MalformedRequestError } from '../model/domain.error';
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

    async getSamplesWithResults(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.getSamplesWithResults.name}, Request received`
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
            const orderId = String(req.body.orderId);

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<SamplesWithResultsCollectionDTO>,
                AxiosResponse<
                    ParseSingleResponse<SamplesWithResultsCollectionDTO>
                >,
                RedirectedGetSamplesWithResultsRequestDTO
            >('functions/getSamplesWithResults', {
                orderId,
                userEmail: user.email
            });

            logger.info(
                `${this.constructor.name}.${this.getSamplesWithResults.name}, Response sent`
            );
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.getSamplesWithResults.name} has thrown an error. ${error}`
            );
            this.fail(res);
        }
    }

    /**
     * Stores BfR analysis results.
     *
     * Unlike the other methods here this one does no authentication of its
     * own: the route is guarded by requireApiKey, so by the time the request
     * arrives the caller is already vouched for. Keeping that out of the
     * controller is what lets the auth scheme be swapped without touching this
     * code.
     */
    async postResults(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postResults.name}, Request received`
        );

        try {
            const results = this.parseResultsBody(req.body);

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<StoreResultsCollectionDTO>,
                AxiosResponse<ParseSingleResponse<StoreResultsCollectionDTO>>,
                RedirectedStoreResultsRequestDTO
            >('functions/storeResults', { results });

            logger.info(
                `${this.constructor.name}.${this.postResults.name}, Response sent`
            );

            // The cloud function reports a rejected import by *returning* an
            // error DTO, which Parse hands back inside a 200. Relaying that as
            // a 200 would make a refused import look successful; answer 422 as
            // the sample endpoints do.
            const result = parseResponse.data
                .result as unknown as DefaultServerErrorDTO;
            if (this.isDefaultServerErrorDTO(result)) {
                this.axiosError(res, result);
                return;
            }
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postResults.name} has thrown an error. ${error}`
            );
            this.handleError(res, error as Error);
        }
    }

    /**
     * Cheap shape guard so obvious nonsense is refused without a round trip to
     * Parse. The per-element validation lives in the cloud function, which is
     * the only place that can check the sample objectIds actually exist.
     */
    private parseResultsBody(body: unknown): StoreResultsRequestDTO {
        if (!Array.isArray(body)) {
            throw new MalformedRequestError(
                'The request body must be an array of result objects.'
            );
        }
        if (body.length === 0) {
            throw new MalformedRequestError(
                'The request body contains no results.'
            );
        }
        return body as StoreResultsRequestDTO;
    }

    private handleError(res: Response, error: Error) {
        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        } else {
            this.fail(res);
        }
    }

    async deleteOrders(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.deleteOrders.name}, Request received`
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
                ParseSingleResponse<OrderDeletionResultDTO>,
                AxiosResponse<ParseSingleResponse<OrderDeletionResultDTO>>,
                RedirectedDeleteOrdersRequestDTO
            >('functions/deleteOrdersByUser', {
                userEmail: user.email
            });

            logger.info(
                `${this.constructor.name}.${this.deleteOrders.name}, Response sent`
            );
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.deleteOrders.name} has thrown an error. ${error}`
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
