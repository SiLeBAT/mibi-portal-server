export enum TokenType {
    RESET, ACTIVATE
}
export interface IUserToken {
    token: string;
    type: TokenType;
    user: string;
}
