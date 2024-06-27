import { TokenType } from '../domain/enums';
import { Institute } from './institute.model';

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
    isVerified(verified?: boolean): boolean;
    isActivated(active?: boolean): boolean;
    getNumberOfFailedAttempts(): number;
    getLastLoginAttempt(): number;
    getFullName(): string;
}

export interface UserToken {
    token: string;
    type: TokenType;
    userId: string;
}

export interface UserPort {
    getUserByEmail(userEmail: string): Promise<User>;
    getUserById(UserId: string): Promise<User>;
}

export interface UserService extends UserPort {
    updateUser(user: User): Promise<User>;
    createUser(user: User, legacySystem?: boolean): Promise<User>;
    hasUserWithEmail(email: string): Promise<boolean>;
}

export interface ParseUserRepository {
    hasUserWithEmail(username: string): Promise<boolean>;
    createUser(user: User, legacySystem?: boolean): Promise<User>;
    findByUserId(id: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    findByUsername(username: string): Promise<User>;
    getPasswordForUser(username: string): Promise<string>;
}
