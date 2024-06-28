import { RecoveryData } from './login.model';
import { User } from './user.model';

export interface RegistrationPort {
    verifyUser(token: string): Promise<string>;
    activateUser(token: string): Promise<string>;
    registerUser(credentials: UserRegistration): Promise<void>;
}

export interface RegistrationService extends RegistrationPort {
    prepareUserForVerification(
        user: User,
        recoveryData: RecoveryData
    ): Promise<void>;
    handleNotActivatedUser(user: User): void;
}

export interface UserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
    host: string;
    legacySystem: boolean;
}

interface BaseNotificationPayload {
    name: string;
    appName: string;
    client_url: string;
}
export interface RequestActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    operating_system: string;
    user_agent: string;
    support_contact: string;
}

export interface RequestAdminActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    email: string;
    institution: string;
    location: string;
}

export interface AdminActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
}

export interface AdminActivationReminderPayload
    extends BaseNotificationPayload {
    location: string;
    email: string;
    institution: string;
}

export interface AlreadyRegisteredUserNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
}
