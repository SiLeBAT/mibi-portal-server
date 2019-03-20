import { Institute } from './institute.model';
import { TokenType } from '../domain/enums';

export interface UserCredentials {
    email: string;
    password: string;
}

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    institution: Institute;
    uniqueId: string;
    readonly password: string;
    isAuthorized(credentials: UserCredentials): Promise<boolean>;
    updatePassword(password: string): Promise<string>;
    updateNumberOfFailedAttempts(increment: boolean): void;
    updateLastLoginAttempt(): void;
    isActivated(active?: boolean): boolean;
    isAdminActivated(active?: boolean): boolean;
    getNumberOfFailedAttempts(): number;
    getLastLoginAttempt(): number;
    getFullName(): string;
}

export interface UserToken {
    token: string;
    type: TokenType;
    userId: string;
}
