import { UserCredentials, User } from './user.model';

export interface UserLoginInformation extends UserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
}

export interface LoginResponse {
    user: User;
    token: string;
    timeToWait?: string;
}

export interface LoginPort {
    loginUser(credentials: UserLoginInformation): Promise<LoginResponse>;
}

export interface LoginService extends LoginPort {}

export interface RecoveryData {
    email: string;
    host: string;
    userAgent: string;
}
export interface PasswordPort {
    recoverPassword(recoveryData: RecoveryData): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
}

export interface PasswordService extends PasswordPort {}
