import { User } from './user.model';
import { RecoveryData } from './login.model';

export interface RegistrationPort {
    activateUser(token: string): Promise<void>;
    adminActivateUser(token: string): Promise<string>;
    registerUser(credentials: UserRegistration): Promise<void>;
}

export interface RegistrationService extends RegistrationPort {
    prepareUserForActivation(
        user: User,
        recoveryData: RecoveryData
    ): Promise<void>;
    handleUserIfNotAdminActivated(user: User): Promise<void>;
}

export interface UserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
    host: string;
}

interface BaseNotificationPayload {
    name: string;
    appName: string;
}
export interface RequestActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    api_url: string;
    operating_system: string;
    user_agent: string;
    support_contact: string;
}

export interface RequestAdminActivationNotificationPayload
    extends BaseNotificationPayload {
    action_url: string;
    api_url: string;
    email: string;
    institution: string;
    location: string;
}

export interface RequestForUnknownInstituteNotificationPayload
    extends BaseNotificationPayload {
    api_url: string;
    email: string;
    institution: string;
}

export interface AdminActivationNotificationPayload
    extends BaseNotificationPayload {}

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
