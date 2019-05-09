import { UserCredentials, User } from './user.model';

export interface UserLoginInformation extends UserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
}

export interface LoginResponse {
    user: User;
    token: string;
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
    requestPasswordReset(recoveryData: RecoveryData): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
}

export interface PasswordService extends PasswordPort {}

interface BaseResetNotificationPayload {
    name: string;
    api_url: string;
    action_url: string;
    appName: string;
}
export interface ResetSuccessNotificationPayload
    extends BaseResetNotificationPayload {
    email: string;
}

export interface ResetRequestNotificationPayload
    extends BaseResetNotificationPayload {
    operating_system: string;
    user_agent: string;
    support_contact: string;
}
