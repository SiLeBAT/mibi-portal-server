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
