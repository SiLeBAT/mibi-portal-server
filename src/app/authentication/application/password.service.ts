import { logger } from '../../../aspects';
import { UserRepository, TokenRepository } from '../../ports';
import { getConfigurationService } from '../../core/application/configuration.service';
import { PasswordService, RecoveryData } from '../model/login.model';
import { generateToken, verifyToken } from '../domain/token.service';
import { TokenType } from './../domain/enums';
import { User, UserToken } from './../model/user.model';
import { NotificationType } from '../../core/domain/enums';
import { NotificationService } from '../../core/model/notification.model';

const appConfig = getConfigurationService().getApplicationConfiguration();
const serverConfig = getConfigurationService().getServerConfiguration();
const generalConfig = getConfigurationService().getGeneralConfiguration();

const APP_NAME = appConfig.appName;
const API_URL = serverConfig.apiUrl;
const SUPPORT_CONTACT = generalConfig.supportContact;

class DefaultPasswordService implements PasswordService {
    constructor(
        private userRepository: UserRepository,
        private tokenRepository: TokenRepository,
        private notificationService: NotificationService
    ) {}

    async recoverPassword(recoveryData: RecoveryData): Promise<void> {
        let user;
        try {
            user = await this.userRepository.findByUsername(recoveryData.email);
        } catch (err) {
            logger.error(
                `recoverPassword: no user for provided email found, error=${err}`
            );
        }

        if (!user) {
            return;
        }

        const hasOldToken = await this.tokenRepository.hasResetTokenForUser(
            user
        );
        if (hasOldToken) {
            await this.tokenRepository.deleteResetTokenForUser(user);
        }
        const token = generateToken(user.uniqueId);
        const resetToken = await this.tokenRepository.saveToken({
            token: token,
            type: TokenType.RESET,
            userId: user.uniqueId
        });

        const requestResetNotification = this.createResetRequestNotification(
            user,
            recoveryData,
            resetToken
        );
        return this.notificationService.sendNotification(
            requestResetNotification
        );
    }

    async resetPassword(token: string, password: string): Promise<void> {
        const userToken = await this.tokenRepository.getUserTokenByJWT(token);
        const userId = userToken.userId;
        verifyToken(token, String(userId));
        const user = await this.userRepository.findById(userId);
        await user.updatePassword(password);
        await this.userRepository.updateUser(user);
        await this.tokenRepository.deleteResetTokenForUser(user);
        const resetSuccessNotification = this.createResetSuccessNotification(
            user
        );
        return this.notificationService.sendNotification(
            resetSuccessNotification
        );
    }

    private createResetRequestNotification(
        user: User,
        recoveryData: RecoveryData,
        resetToken: UserToken
    ) {
        return {
            type: NotificationType.REQUEST_RESET,
            title: `Setzen Sie Ihr ${APP_NAME}-Konto Passwort zurück.`, // `Reset Password for ${APP_NAME}`;
            payload: {
                name: user.firstName + ' ' + user.lastName,
                action_url: API_URL + '/users/reset/' + resetToken.token,
                api_url: API_URL,
                operating_system: recoveryData.host,
                user_agent: recoveryData.userAgent,
                support_contact: SUPPORT_CONTACT,
                appName: APP_NAME
            },
            meta: {
                email: user.email
            }
        };
    }

    private createResetSuccessNotification(user: User) {
        return {
            type: NotificationType.RESET_SUCCESS,
            title: `Passwort für ${APP_NAME}-Konto erfolgreich zurückgesetzt.`, // `Reset Password for ${APP_NAME} successful`;
            payload: {
                name: user.firstName + ' ' + user.lastName,
                api_url: API_URL,
                email: user.email,
                action_url: API_URL + '/users/login',
                appName: APP_NAME
            },
            meta: {
                email: user.email
            }
        };
    }
}

export function createService(
    userRepository: UserRepository,
    tokenRepository: TokenRepository,
    notifcationService: NotificationService
): PasswordService {
    return new DefaultPasswordService(
        userRepository,
        tokenRepository,
        notifcationService
    );
}
