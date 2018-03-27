import * as config from 'config';
import { IUserRepository, ITokenRepository, IInstitutionRepository } from '../../ports';
import { logger } from '../../../aspects';
import { IUser, createUser, TokenType, generateToken, verifyToken, IUserToken } from './../domain';
import { IRecoveryData, INotificationService, NotificationType } from '../../sharedKernel/';
import { ApplicationDomainError } from '../../sharedKernel/errors';

// TODO: Should these be here?  Should they not be added later?
const APP_NAME = config.get('appName');
const API_URL = config.get('server.apiUrl');
const SUPPORT_CONTACT = config.get('supportContact');

export interface IRegistrationPort {
    activateUser(token: string): Promise<void>;
    registerUser(credentials: IUserRegistration): Promise<void>;
}

export interface IRegistrationService extends IRegistrationPort {
    prepareUserForActivation(user: IUser, recoveryData: IRecoveryData): Promise<void>;
}

// TODO: Fix or remove this interface
export interface IUserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
    host: string;
}

class RegistrationService implements IRegistrationService {

    constructor(
        private userRepository: IUserRepository,
        private tokenRepository: ITokenRepository,
        private institutionRepository: IInstitutionRepository,
        private notificationService: INotificationService) { }

    async activateUser(token: string): Promise<void> {
        const { userId } = await this.tokenRepository.getUserTokenByJWT(token);
        verifyToken(token, String(userId));
        const user = await this.userRepository.findById(userId);
        if (!user) throw new ApplicationDomainError(`Unknown user. id=${userId}`);
        user.isActivated(true);
        await this.userRepository.updateUser(user);
        await this.tokenRepository.deleteTokenForUser(user);
        logger.verbose('User activation successful');
        return;
    }

    async registerUser(credentials: IUserRegistration): Promise<void> {

        const result = await this.userRepository.hasUser(credentials.email);
        if (result) throw new ApplicationDomainError(`Registration failed. User already exists, email=${credentials.email}`);

        const inst = await this.institutionRepository.findById(credentials.institution);

        if (!inst) throw new ApplicationDomainError(`Institution not found, id=${credentials.institution}`);

        const newUser = createUser('0000', credentials.email, credentials.firstName,
            credentials.lastName, inst, '');

        await newUser.updatePassword(credentials.password);
        const user = await this.userRepository.createUser(newUser);

        return this.prepareUserForActivation(user, {
            userAgent: credentials.userAgent,
            email: user.email,
            host: credentials.host
        });
    }

    async prepareUserForActivation(user: IUser, recoveryData: IRecoveryData): Promise<void> {

        this.deleteOldTokensForUser(user).then(
            successfullyDeleted => {
                if (!successfullyDeleted) {
                    logger.warn('An error occured deleting token in DB for user', { 'user.uniqueId': user.uniqueId });
                }
            },
            fail => { logger.warn('An error occured deleting token in DB for user', { 'user.uniqueId': user.uniqueId }); }
        );

        const token = generateToken(user.uniqueId);

        const activationToken = await this.tokenRepository.saveToken({
            token: token,
            type: TokenType.ACTIVATE,
            userId: user.uniqueId
        });

        const requestActivationNotification = this.createRequestActivationNotification(user, recoveryData, activationToken);
        return this.notificationService.sendNotification(requestActivationNotification);
    }

    // TODO Too many parameters. Reduce
    private createRequestActivationNotification(user: IUser, recoveryData: IRecoveryData, activationToken: IUserToken) {
        return {
            type: NotificationType.REQUEST_ACTIVATION,
            title: `Aktivieren Sie Ihr Konto für ${APP_NAME}`,// `Activate your account for ${APP_NAME}`;
            payload: {
                'name': user.firstName + ' ' + user.lastName,
                'action_url': API_URL + '/users/activate/' + activationToken.token,
                'api_url': API_URL,
                'operating_system': recoveryData.host,
                'user_agent': recoveryData.userAgent,
                'support_contact': SUPPORT_CONTACT,
                'appName': APP_NAME
            },
            meta: {
                email: user.email
            }
        };
    }
    // TODO: Is this method neccessary?
    private async deleteOldTokensForUser(user: IUser): Promise<boolean> {
        const hasOldToken = await this.tokenRepository.hasTokenForUser(user);
        if (hasOldToken) {
            return this.tokenRepository.deleteTokenForUser(user);
        }
        return true;
    }
}

export function createService(userRepository: IUserRepository, tokenRepository: ITokenRepository, institutionRepository: IInstitutionRepository, notificationService: INotificationService): IRegistrationService {
    return new RegistrationService(userRepository, tokenRepository, institutionRepository, notificationService);
}
