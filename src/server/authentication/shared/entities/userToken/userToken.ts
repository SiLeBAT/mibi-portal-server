import { verify, sign } from 'jsonwebtoken';
import * as config from 'config';

const EXPIRATION_TIME = 60 * 60 * 12;
const JWT_SECRET: string = config.get('server.jwtSecret');

export enum TokenType {
    RESET, ACTIVATE
}
export interface IUserToken {
    token: string;
    type: TokenType;
    user: string;
}
// TODO: Fix this class
export class UserToken implements IUserToken {
    token: string;
    type: TokenType;
    user: string;

    static generateToken(id: string) {
        return sign(
            { sub: id },
            JWT_SECRET,
            { expiresIn: EXPIRATION_TIME }
        );
    }

    static verifyToken(token: string, id: string) {
        return verify(token, JWT_SECRET, { subject: id });
    }
}
