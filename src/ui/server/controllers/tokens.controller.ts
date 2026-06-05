import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    AuthorizationError,
    TokenPayload,
    TokenPort
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { TokensController } from '../model/controller.model';
import { SERVER_ERROR_CODE } from '../model/enums';
import { TokenRefreshConfirmationResponseDTO } from '../model/response.model';
import { AbstractController } from './abstract.controller';

export class DefaultTokensController
    extends AbstractController
    implements TokensController
{
    constructor(private tokenService: TokenPort) {
        super();
    }

    postTokens(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postTokens.name}, Request received`
        );
        try {
            const oldToken: string | null = getTokenFromHeader(req);
            if (!oldToken) {
                throw new AuthorizationError('Invalid token');
            }
            const payload: TokenPayload =
                this.tokenService.verifyToken(oldToken);
            const token = this.tokenService.generateToken(payload);
            const dto: TokenRefreshConfirmationResponseDTO = {
                refresh: true,
                token: token
            };
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
