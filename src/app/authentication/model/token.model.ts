import { TokenType } from '../domain/enums';
import { User, UserToken } from './user.model';

export interface TokenPayload {
    sub: string;
}

export interface TokenUserInfo extends TokenPayload {
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
export interface AdminTokenPayload extends TokenPayload {
    admin: boolean;
}

export interface TokenPort {
    generateToken(userId: string): string;
    verifyTokenWithUser(token: string, id: string): TokenPayload;
    verifyToken(token: string): TokenUserInfo;
}

export interface TokenService extends TokenPort {
    generateAdminToken(id: string): string;
    saveToken(
        token: string,
        type: TokenType,
        userId: string
    ): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
    deleteTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    hasTokenForUser(user: User, type?: TokenType): Promise<boolean>;
}

export interface TokenRepository {
    hasTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    deleteTokenForUser(user: User, type?: TokenType): Promise<boolean>;
    saveToken(token: UserToken): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
}
