import { inject, injectable } from 'inversify';
import { NotificationType } from '../../core/domain/enums';
import { ConfigurationService } from '../../core/model/configuration.model';
import {
    EmailNotificationMeta,
    Notification,
    NotificationService
} from '../../core/model/notification.model';
import {
    PasswordService,
    RecoveryData,
    ResetRequestNotificationPayload,
    ResetSuccessNotificationPayload
} from '../model/login.model';
import { TokenService } from '../model/token.model';
import { APPLICATION_TYPES } from './../../application.types';
import { TokenType } from './../domain/enums';
import { User, UserService, UserToken } from './../model/user.model';
@injectable()
export class DefaultPasswordService implements PasswordService {
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
        @inject(APPLICATION_TYPES.UserService) private userService: UserService
    ) {
        this.appName =
            this.configurationService.getApplicationConfiguration().appName;
        this.clientUrl =
            this.configurationService.getApplicationConfiguration().clientUrl;
        this.supportContact =
            this.configurationService.getApplicationConfiguration().supportContact;
    }
    async requestPasswordReset(recoveryData: RecoveryData): Promise<void> {
        const user = await this.userService.getUserByEmail(recoveryData.email);

        const hasOldToken = await this.tokenService.hasTokenForUser(
            user,
            TokenType.RESET
        );
        if (hasOldToken) {
            await this.tokenService.deleteTokenForUser(user, TokenType.RESET);
        }
        const token = this.tokenService.generateToken({
            sub: user.uniqueId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            institution: {
                ...user.institution
            }
        });
        const resetToken = await this.tokenService.saveToken(
            token,
            TokenType.RESET,
            user.uniqueId
        );

        const requestResetNotification = this.createResetRequestNotification(
            user,
            recoveryData,
            resetToken
        );
        this.notificationService.sendNotification(requestResetNotification);
    }

    async resetPassword(token: string, password: string, legacySystem = false): Promise<void> {
        const userToken = await this.tokenService.getUserTokenByJWT(token);
        const userId = userToken.userId;
        this.tokenService.verifyTokenWithUser(token, String(userId));
        const user = await this.userService.getUserById(userId);
        await user.updatePassword(password);
        await this.userService.updateUser(user);
        await this.tokenService.deleteTokenForUser(user, TokenType.RESET);
        const resetSuccessNotification =
            this.createResetSuccessNotification(user, legacySystem);
        this.notificationService.sendNotification(resetSuccessNotification);
    }

    private createResetRequestNotification(
        user: User,
        recoveryData: RecoveryData,
        resetToken: UserToken
    ): Notification<ResetRequestNotificationPayload, EmailNotificationMeta> {

        const targetURL = recoveryData.legacySystem ? this.legacySystemURL : this.clientUrl;
        return {
            type: NotificationType.REQUEST_RESET,
            payload: {
                name: user.firstName + ' ' + user.lastName,
                action_url: targetURL + '/users/reset/' + resetToken.token,
                client_url: targetURL,
                operating_system: recoveryData.host,
                user_agent: recoveryData.userAgent,
                support_contact: this.supportContact,
                appName: this.appName
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Setzen Sie Ihr ${this.appName}-Konto Passwort zurück.`
            )
        };
    }

    private createResetSuccessNotification(
        user: User,
        legacySystem = false
    ): Notification<ResetSuccessNotificationPayload, EmailNotificationMeta> {
        const targetURL = legacySystem ? this.legacySystemURL : this.clientUrl;
        return {
            type: NotificationType.RESET_SUCCESS,
            payload: {
                name: user.firstName + ' ' + user.lastName,
                client_url: targetURL,
                email: user.email,
                action_url: targetURL + '/users/login',
                appName: this.appName
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                user.email,
                `Passwort für ${this.appName}-Konto erfolgreich zurückgesetzt.`
            )
        };
    }
}
