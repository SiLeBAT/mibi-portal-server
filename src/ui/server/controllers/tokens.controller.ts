import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    AuthorizationError,
    TokenPayload,
    TokenPort
} from '../../../app/ports';
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

    async postTokens(req: Request, res: Response) {
        await this.handleRequest(res, this.postTokens.name, () => {
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
            this.ok(res, dto);
        });
    }

    protected handleError(res: Response, error: unknown) {
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
