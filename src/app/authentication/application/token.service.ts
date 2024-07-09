import { inject, injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { ConfigurationService } from '../../core/model/configuration.model';
import { TokenType } from '../domain/enums';
import {
    AdminTokenPayload,
    ParseTokenRepository,
    TokenPayload,
    TokenService
} from '../model/token.model';
import { User, UserToken } from '../model/user.model';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultTokenService implements TokenService {
    private expirationTime = 60 * 60 * 24;
    private adminExpirationTime = 60 * 60 * 24 * 7;
    private jwtSecret: string;
    constructor(
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.ParseTokenRepository)
        private parseTokenRepository: ParseTokenRepository
    ) {
        const serverConfig =
            this.configurationService.getApplicationConfiguration();
        this.jwtSecret = serverConfig.jwtSecret;
    }

    generateToken(payload: TokenPayload): string {
        return sign(payload, this.jwtSecret, {
            expiresIn: this.expirationTime
        });
    }

    generateAdminToken(payload: TokenPayload): string {
        const adminPayload: AdminTokenPayload = {
            ...payload,
            admin: true
        };
        return sign(adminPayload, this.jwtSecret, {
            expiresIn: this.adminExpirationTime
        });
    }

    verifyTokenWithUser(token: string, id: string): TokenPayload {
        return verify(token, this.jwtSecret, { subject: id }) as TokenPayload;
    }

    verifyToken(token: string): TokenPayload {
        return verify(token, this.jwtSecret) as TokenPayload;
    }

    async saveToken(
        token: string,
        type: TokenType,
        userId: string
    ): Promise<UserToken> {
        return this.parseTokenRepository.saveToken({
            token,
            type,
            userId
        });
    }

    async getUserTokenByJWT(token: string): Promise<UserToken> {
        return this.parseTokenRepository.getUserTokenByJWT(token);
    }

    async deleteTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return this.parseTokenRepository.deleteTokenForUser(user, type);
    }

    async hasTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return this.parseTokenRepository.hasTokenForUser(user, type);
    }
}
