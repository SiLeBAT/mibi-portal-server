import { TokenType } from './enums';

export interface IUserToken {
    token: string;
    type: TokenType;
    userId: string;
}

export class UserToken implements IUserToken {
    token: string;
    type: TokenType;
    userId: string;
}
