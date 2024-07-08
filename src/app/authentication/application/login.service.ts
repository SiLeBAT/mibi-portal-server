import { inject, injectable } from 'inversify';
import moment from 'moment';
import { ConfigurationService } from '../../core/model/configuration.model';
import {
    LoginResponse,
    LoginService,
    UserLoginInformation
} from '../model/login.model';
import { RegistrationService } from '../model/registration.model';
import { TokenService } from '../model/token.model';
import { User, UserService } from '../model/user.model';
import { APPLICATION_TYPES } from './../../application.types';
import {
    AuthorizationError,
    UserNotActivatedError,
    UserNotVerifiedError
} from './../domain/domain.error';
@injectable()
export class DefaultLoginService implements LoginService {
    private threshold: number;
    private secondsDelay: number;

    constructor(
        @inject(APPLICATION_TYPES.RegistrationService)
        private registrationService: RegistrationService,
        @inject(APPLICATION_TYPES.TokenService)
        private tokenService: TokenService,
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.UserService) private userService: UserService
    ) {
        this.threshold =
            this.configurationService.getApplicationConfiguration().login.threshold;
        this.secondsDelay =
            this.configurationService.getApplicationConfiguration().login.secondsDelay;
    }

    async loginUser(credentials: UserLoginInformation): Promise<LoginResponse> {
        const user = await this.userService.getUserByEmail(credentials.email);

        if (!user.isVerified()) {
            return this.registrationService
                .prepareUserForVerification(user, {
                    userAgent: credentials.userAgent as string,
                    email: user.email,
                    host: credentials.host as string
                })
                .then(() => {
                    throw new UserNotVerifiedError(
                        `User not verified. user=${user.email}`
                    );
                })
                .catch(error => {
                    throw error;
                });
        }

        if (!user.isActivated()) {
            this.registrationService.handleNotActivatedUser(user);

            throw new UserNotActivatedError(
                `User not activated. user=${user.email}`
            );
        }

        const diffToDelay = this.diffTimeSinceLastFailedLogin(user);
        if (this.hasToManyFailedAttempts(user) && diffToDelay >= 0) {
            const timeToWait = moment
                .duration(diffToDelay, 'seconds')
                .asSeconds();
            const error = new AuthorizationError(
                `Too many failed attempts. user=${String(
                    user
                )}; timeToWait=${timeToWait}`
            );
            error.timeToWait = timeToWait;
            throw error;
        }

        if (await user.isAuthorized(credentials)) {
            if (user.getNumberOfFailedAttempts() > 0) {
                user.updateNumberOfFailedAttempts(false);
                await this.userService.updateUser(user);
            }
            await this.userService.updateUser(user);

            return {
                user: user,
                token: this.tokenService.generateToken({
                    sub: user.uniqueId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    institution: {
                        ...user.institution
                    }
                })
            };
        }

        user.updateNumberOfFailedAttempts(true);
        user.updateLastLoginAttempt();
        await this.userService.updateUser(user);

        throw new AuthorizationError(`User not authorized. user=${user.email}`);
    }

    private hasToManyFailedAttempts(user: User): boolean {
        return user.getNumberOfFailedAttempts() >= this.threshold
            ? true
            : false;
    }

    private diffTimeSinceLastFailedLogin(user: User): number {
        moment.locale('de');
        const currentMoment = moment();
        const lastMoment = moment(user.getLastLoginAttempt());
        const diffToLast = moment.duration(currentMoment.diff(lastMoment));
        const diffToDelay = Math.round(
            this.secondsDelay - diffToLast.asSeconds()
        );

        return diffToDelay;
    }
}
