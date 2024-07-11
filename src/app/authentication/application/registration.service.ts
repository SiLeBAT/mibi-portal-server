import { inject, injectable } from 'inversify';
import { logger } from '../../../aspects';
import { NotificationType } from '../../core/domain/enums';
import { ConfigurationService } from '../../core/model/configuration.model';
import {
    EmailNotificationMeta,
    Notification,
    NotificationService
} from '../../core/model/notification.model';
import { UserAlreadyExistsError } from '../domain/domain.error';
import { TokenType } from '../domain/enums';
import { createUser } from '../domain/user.entity';
import { InstituteService, ParseInstituteRepository } from '../model/institute.model';
import { RecoveryData } from '../model/login.model';
import {
    AdminActivationNotificationPayload,
    AdminActivationReminderPayload,
    AlreadyRegisteredUserNotificationPayload,
    RegistrationService,
    RequestActivationNotificationPayload,
    RequestAdminActivationNotificationPayload,
    UserRegistration
} from '../model/registration.model';
import { TokenService } from '../model/token.model';
import { User, UserService, UserToken } from '../model/user.model';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultRegistrationService implements RegistrationService {
    private appName: string;
    private clientUrl: string;
    private supportContact: string;
    private legacySystemURL: string = "https://nolar-dev.bfr.berlin/";
    constructor(
        @inject(APPLICATION_TYPES.NotificationService)
        private notificationService: NotificationService,
        @inject(APPLICATION_TYPES.TokenService)
        private tokenService: TokenService,
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.UserService) private userService: UserService,
        @inject(APPLICATION_TYPES.InstituteService)
        private instituteService: InstituteService,
        @inject(APPLICATION_TYPES.ParseInstituteRepository)
        private parseInstituteRepository: ParseInstituteRepository
    ) {
        this.appName =
            this.configurationService.getApplicationConfiguration().appName;
        this.clientUrl =
            this.configurationService.getApplicationConfiguration().clientUrl;
        this.supportContact =
            this.configurationService.getApplicationConfiguration().supportContact;
    }

    async verifyUser(token: string): Promise<string> {
        const userToken = await this.tokenService.getUserTokenByJWT(token);
        const userId = userToken.userId;
        this.tokenService.verifyTokenWithUser(token, String(userId));
        const user = await this.userService.getUserById(userId);
        user.isVerified(true);
        await this.userService.updateUser(user);
        await this.tokenService.deleteTokenForUser(user);
        await this.prepareUserForAdminActivation(user);
        logger.info(
            `${this.constructor.name}.${this.verifyUser.name}, User verification successful. token=${token}`
        );
        return user.email;
    }

    async activateUser(adminToken: string): Promise<string> {
        const userAdminToken = await this.tokenService.getUserTokenByJWT(
            adminToken
        );
        const userId = userAdminToken.userId;
        this.tokenService.verifyTokenWithUser(adminToken, String(userId));
        const user = await this.userService.getUserById(userId);
        user.isActivated(true);
        await this.userService.updateUser(user);
        await this.tokenService.deleteTokenForUser(user, TokenType.ADMIN);
        const adminActivationNotification =
            this.createAdminActivationNotification(user);
        this.notificationService.sendNotification(adminActivationNotification);
        const userName = user.firstName + ' ' + user.lastName;
        logger.verbose(
            `${this.constructor.name}.${this.activateUser.name}, User activation successful.`
        );
        return userName;
    }

    async registerUser(credentials: UserRegistration): Promise<void> {
        const result = await this.userService.hasUserWithEmail(
            credentials.email
        );
        if (result) {
            this.handleAlreadyRegisteredUser(credentials);
            throw new UserAlreadyExistsError(
                'Registration failed. User already exists'
            );
        }
        const inst = await this.instituteService.getInstituteById(
            credentials.institution
        );

        const newUser = createUser(
            '0000',
            credentials.email,
            credentials.firstName,
            credentials.lastName,
            inst,
            ''
        );

        await newUser.updatePassword(credentials.password);
        const user = await this.userService.createUser(newUser, credentials.legacySystem);
        const recoveryData: RecoveryData = {
            userAgent: credentials.userAgent,
            email: user.email,
            host: credentials.host,
            legacySystem: credentials.legacySystem
        };

        return this.prepareUserForVerification(user, recoveryData);
    }

    async prepareUserForVerification(
        user: User,
        recoveryData: RecoveryData
    ): Promise<void> {
        const hasOldToken = await this.tokenService.hasTokenForUser(user);
        if (hasOldToken) {
            await this.tokenService.deleteTokenForUser(user);
        }
        const institute = await this.parseInstituteRepository.findByInstituteId
            (user.institution.uniqueId);
        const token = this.tokenService.generateToken({
            sub: user.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            institution: {
                ...institute
            }
        });

        const activationToken = await this.tokenService.saveToken(
            token,
            TokenType.ACTIVATE,
            user.uniqueId
        );

        const requestActivationNotification =
            this.createRequestActivationNotification(
                user,
                recoveryData,
                activationToken
            );

        this.notificationService.sendNotification(
            requestActivationNotification
        );
    }

    handleNotActivatedUser(user: User): void {
        const requestNotAdminActivatedNotification =
            this.createNotAdminActivatedNotification(user);
        this.notificationService.sendNotification(
            requestNotAdminActivatedNotification
        );

        const requestAdminActivationReminder =
            this.createAdminActivationReminder(user);

        this.notificationService.sendNotification(
            requestAdminActivationReminder
        );
    }

    private async prepareUserForAdminActivation(user: User): Promise<void> {
        const hasOldAdminToken = await this.tokenService.hasTokenForUser(
            user,
            TokenType.ADMIN
        );
        if (hasOldAdminToken) {
            await this.tokenService.deleteTokenForUser(user, TokenType.ADMIN);
        }

        const adminToken = this.tokenService.generateAdminToken({
            sub: user.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            institution: {
                ...user.institution
            }
        });

        const adminActivationToken = await this.tokenService.saveToken(
            adminToken,
            TokenType.ADMIN,
            user.uniqueId
        );

        const requestAdminActivationNotification =
            this.createRequestAdminActivationNotification(
                user,
                adminActivationToken
            );

        this.notificationService.sendNotification(
            requestAdminActivationNotification
        );
    }

    private handleAlreadyRegisteredUser(credentials: UserRegistration): void {
        const userAlreadyRegisteredNotification =
            this.createAlreadyRegisteredUserNotification(credentials);
        this.notificationService.sendNotification(
            userAlreadyRegisteredNotification
        );
    }

    private createRequestActivationNotification(
        user: User,
        recoveryData: RecoveryData,
        activationToken: UserToken
    ): Notification<
        RequestActivationNotificationPayload,
        EmailNotificationMeta
    > {
        const targetURL = recoveryData.legacySystem ? this.legacySystemURL : this.clientUrl;
        return {
            type: NotificationType.REQUEST_ACTIVATION,
            payload: {
                name: user.firstName + ' ' + user.lastName,
                action_url:
                    targetURL + '/users/activate/' + activationToken.token,
                client_url: targetURL,
                operating_system: recoveryData.host,
                user_agent: recoveryData.userAgent,
                support_contact: this.supportContact,
                appName: this.appName
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Bestätigen Sie Ihre E-Mail-Adresse für das ${this.appName} `
            )
        };
    }

    private createRequestAdminActivationNotification(
        user: User,
        adminActivationToken: UserToken
    ): Notification<
        RequestAdminActivationNotificationPayload,
        EmailNotificationMeta
    > {
        const fullName = user.firstName + ' ' + user.lastName;

        return {
            type: NotificationType.REQUEST_ADMIN_ACTIVATION,
            payload: {
                name: fullName,
                action_url:
                    this.clientUrl +
                    '/users/adminactivate/' +
                    adminActivationToken.token,
                client_url: this.clientUrl,
                email: user.email,
                institution: user.institution.name,
                location: user.institution.addendum,
                appName: this.appName
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                this.supportContact,
                `Aktivieren Sie das ${this.appName} Konto für ${fullName}`
            )
        };
    }

    private createAdminActivationNotification(
        user: User
    ): Notification<AdminActivationNotificationPayload, EmailNotificationMeta> {
        const fullName = user.firstName + ' ' + user.lastName;

        return {
            type: NotificationType.NOTIFICATION_ADMIN_ACTIVATION,

            payload: {
                name: fullName,
                appName: this.appName,
                action_url: this.clientUrl + '/users/login',
                client_url: this.clientUrl
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Admin Aktivierung Ihres ${this.appName} Kontos`
            )
        };
    }

    private createNotAdminActivatedNotification(
        user: User
    ): Notification<AdminActivationNotificationPayload, EmailNotificationMeta> {
        const fullName = user.firstName + ' ' + user.lastName;

        return {
            type: NotificationType.NOTIFICATION_NOT_ADMIN_ACTIVATED,
            payload: {
                name: fullName,
                appName: this.appName,
                action_url: this.clientUrl + '/users/login',
                client_url: this.clientUrl
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Noch keine Admin Aktivierung Ihres ${this.appName} Kontos`
            )
        };
    }

    private createAdminActivationReminder(
        user: User
    ): Notification<AdminActivationReminderPayload, EmailNotificationMeta> {
        const fullName = user.firstName + ' ' + user.lastName;

        return {
            type: NotificationType.REMINDER_ADMIN_ACTIVATION,
            payload: {
                name: fullName,
                email: user.email,
                institution: user.institution.name,
                location: user.institution.addendum,
                appName: this.appName,
                client_url: this.clientUrl
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                this.supportContact,
                `Erinnerung: Bitte aktivieren Sie das ${this.appName} Konto für ${fullName}`
            )
        };
    }

    private createAlreadyRegisteredUserNotification(
        credentials: UserRegistration
    ): Notification<
        AlreadyRegisteredUserNotificationPayload,
        EmailNotificationMeta
    > {
        const fullName = credentials.firstName + ' ' + credentials.lastName;

        return {
            type: NotificationType.NOTIFICATION_ALREADY_REGISTERED,
            payload: {
                name: fullName,
                action_url: this.clientUrl + '/users/recovery',
                appName: this.appName,
                client_url: this.clientUrl
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                credentials.email,
                `Ihre Registrierung für ein ${this.appName} Konto`
            )
        };
    }
}
