import { Request, Response } from 'express';
import {
    controller,
    httpPost,
    request,
    response
} from 'inversify-express-utils';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    AuthorizationError
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { TokensController } from '../model/controller.model';
import { API_ROUTE, SERVER_ERROR_CODE } from '../model/enums';
import { TokenRefreshConfirmationResponseDTO } from '../model/response.model';

import { AxiosResponse } from 'axios';
import { RedirectionController } from './redirection.controller';
enum TOKENS_ROUTE {
    ROOT = '/tokens'
}
@controller(API_ROUTE.V2 + TOKENS_ROUTE.ROOT)
export class DefaultTokensController
    extends RedirectionController
    implements TokensController {

    @httpPost('/')
    async postTokens(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postTokens.name}, Request received`
        );
        try {
            const oldToken: string | null = getTokenFromHeader(req);
            if (!oldToken) {
                throw new AuthorizationError('Invalid token');
            }
            const dto = await this.redirectionTarget.post<TokenRefreshConfirmationResponseDTO, AxiosResponse<TokenRefreshConfirmationResponseDTO>, TokenRefreshConfirmationResponseDTO>(TOKENS_ROUTE.ROOT).then((response) => {
                return response.data;
            })
                .catch(error => {
                    logger.info(
                        `${this.constructor.name}.${this.postTokens.name} has thrown an error. ${error}`
                    );
                    this.handleError(res, error);
                });

            logger.info(
                `${this.constructor.name}.${this.postTokens.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postTokens.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: Error) {
        if (
            error instanceof AuthorizationError ||
            error instanceof JsonWebTokenError
        ) {
            const dto = {
                message: error.message,
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR
            };
            this.unauthorized(res, dto);
        } else {
            this.fail(res);
        }
    }
}
