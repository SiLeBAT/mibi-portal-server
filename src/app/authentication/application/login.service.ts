import * as moment from 'moment';
import { logger } from './../../../aspects';
import {
    LoginService,
    UserLoginInformation,
    LoginResponse,
    RecoveryData
} from '../model/login.model';
import { RegistrationService } from '../model/registration.model';
import { getConfigurationService } from '../../core/application/configuration.service';
import { generateToken } from '../domain/token.service';
import { ApplicationDomainError } from '../../core/domain/domain.error';
import { User } from '../model/user.model';
import { UserRepository } from '../../ports';

const appConfig = getConfigurationService().getApplicationConfiguration();

const THRESHOLD: number = appConfig.login.threshold;
const SECONDS_DELAY: number = appConfig.login.secondsDelay;

class DefaultLoginService implements LoginService {
    constructor(
        private userRepository: UserRepository,
        private activationService: RegistrationService
    ) {}

    async loginUser(credentials: UserLoginInformation): Promise<LoginResponse> {
        const user = await this.userRepository.findByUsername(
            credentials.email
        );

        if (!user.isActivated()) {
            return this.rejectInactiveUser(user, {
                userAgent: credentials.userAgent as string,
                email: user.email,
                host: credentials.host as string
            });
        }

        if (!user.isAdminActivated()) {
            return this.rejectAdminInactiveUser(user);
        }

        const diffToDelay = this.diffTimeSinceLastFailedLogin(user);
        if (this.hasToManyFailedAttempts(user) && diffToDelay >= 0) {
            return {
                user: user,
                token: '',
                timeToWait: this.timeToWait(diffToDelay)
            };
        }

        if (await user.isAuthorized(credentials)) {
            if (user.getNumberOfFailedAttempts() > 0) {
                user.updateNumberOfFailedAttempts(false);
                await this.userRepository.updateUser(user);
            }
            await this.userRepository.updateUser(user);

            return {
                user: user,
                token: generateToken(user.uniqueId)
            };
        }

        user.updateNumberOfFailedAttempts(true);
        user.updateLastLoginAttempt();
        await this.userRepository.updateUser(user);

        throw new ApplicationDomainError(
            `User not authorized. user=${user.email}`
        );
    }

    private async rejectInactiveUser(
        user: User,
        recoveryData: RecoveryData
    ): Promise<LoginResponse> {
        logger.verbose(
            'LoginService.rejectInactiveUser, Inactive account failed to log in.'
        );
        return this.activationService
            .prepareUserForActivation(user, recoveryData)
            .then(() => {
                throw new ApplicationDomainError(
                    `User inactive. user=${user.email}`
                );
            });
    }

    private async rejectAdminInactiveUser(user: User): Promise<LoginResponse> {
        logger.verbose(
            'LoginService.rejectAdminInactiveUser, Admin inactive account failed to log in.'
        );
        return this.activationService
            .handleUserIfNotAdminActivated(user)
            .then(() => {
                throw new ApplicationDomainError(
                    `User admin inactive. user=${user.email}`
                );
            });
    }

    private hasToManyFailedAttempts(user: User): boolean {
        return user.getNumberOfFailedAttempts() >= THRESHOLD ? true : false;
    }

    private diffTimeSinceLastFailedLogin(user: User): number {
        moment.locale('de');
        const currentMoment = moment();
        const lastMoment = moment(user.getLastLoginAttempt());
        const diffToLast = moment.duration(currentMoment.diff(lastMoment));
        const diffToDelay = Math.round(SECONDS_DELAY - diffToLast.asSeconds());

        return diffToDelay;
    }

    private timeToWait(diffToDelay: number): string {
        moment.locale('de');

        const diffDuration = moment.duration(diffToDelay, 'seconds');
        const minutes = ('0' + diffDuration.minutes()).slice(-2);
        const seconds = ('0' + diffDuration.seconds()).slice(-2);

        return `${minutes}:${seconds} Min`;
    }
}

export function createService(
    userRepository: UserRepository,
    activationService: RegistrationService
): LoginService {
    return new DefaultLoginService(userRepository, activationService);
}
