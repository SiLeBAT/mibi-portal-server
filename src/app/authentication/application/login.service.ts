import { IUser, IUserCredentials, generateToken } from './../domain';
import { IUserRepository } from '../../ports';
import { IRecoveryData } from './notification.service';
import { logger } from './../../../aspects';
import { IRegistrationService } from '.';

export interface IUserLoginInformation extends IUserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
}

export interface ILoginResponse {
    user: IUser;
    token: string;

}

export interface ILoginPort {
    loginUser(credentials: IUserLoginInformation): Promise<ILoginResponse>;
}

export interface ILoginService extends ILoginPort { }

class LoginService implements ILoginService {

    constructor(private userRepository: IUserRepository, private activationService: IRegistrationService) { }

    async loginUser(credentials: IUserLoginInformation): Promise<ILoginResponse> {

        const user = await this.userRepository.findByUsername(credentials.email);

        if (!user.isActivated()) {

            return this.rejectInactiveUser(user, {
                userAgent: credentials.userAgent as string,
                email: user.email,
                host: credentials.host as string
            });

        }
        const isAuthorized = await user.isAuthorized(credentials);

        if (isAuthorized) {
            return {
                user: user,
                token: generateToken(user.uniqueId)
            };
        }

        throw new Error(`Unable to login user user=${user.email}`);
    }

    private async rejectInactiveUser(user: IUser, recoveryData: IRecoveryData): Promise<ILoginResponse> {
        logger.verbose('Inactive account failed to log in.');
        return this.activationService.prepareUserForActivation(user, recoveryData).then(
            () => {
                throw new Error(`Unable to login user user=${user.email}`);
            }
        ).catch(
            (err: Error) => {
                throw new Error(`Unable to prepare user for activation user.uniquId=${user.uniqueId} error=${err}`);
            }
        );
    }
}

export function createService(userRepository: IUserRepository, activationService: IRegistrationService): ILoginService {
    return new LoginService(userRepository, activationService);
}
