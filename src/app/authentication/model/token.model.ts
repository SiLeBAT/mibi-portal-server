import { TokenType } from '../domain/enums';
import { User, UserToken } from './user.model';

export interface TokenUserInfo {
    firstName: string;
    lastName: string;
    email: string;
    institution: {
        stateShort: string;
        name: string;
        addendum: string;
        city: string;
        zip: string;
        phone: string;
        fax: string;
        email: string[];
    };
}
export interface TokenPayload extends TokenUserInfo {
    sub: string;
}

export interface AdminTokenPayload extends TokenPayload {
    admin: boolean;
}

export interface TokenPort {
    generateToken(payload: TokenPayload): string;
    verifyTokenWithUser(token: string, id: string): TokenPayload;
    verifyToken(token: string): TokenPayload;
}

export interface TokenService extends TokenPort {
    generateAdminToken(payload: TokenPayload): string;
    saveToken(
        token: string,
        type: TokenType,
        userId: string
    ): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
    deleteTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    hasTokenForUser(user: User, type?: TokenType): Promise<boolean>;
}

export interface ParseTokenRepository {
    hasTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    deleteTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    saveToken(token: UserToken): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
}
