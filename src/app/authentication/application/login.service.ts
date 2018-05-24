import { IUser, IUserCredentials, generateToken } from './../domain';
import { IUserRepository } from '../../ports';
import { logger } from './../../../aspects';
import { IRegistrationService } from '.';
import { ApplicationDomainError } from '../../sharedKernel/errors';
import { IRecoveryData } from '../../sharedKernel';

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

        if (!user) throw new ApplicationDomainError(`User not known. email=${credentials.email}`);

        if (!user.isActivated() || !user.isAdminActivated()) {

            return this.rejectInactiveUser(user, {
                userAgent: credentials.userAgent as string,
                email: user.email,
                host: credentials.host as string
            });

        }

        if (await user.isAuthorized(credentials)) {
            return {
                user: user,
                token: generateToken(user.uniqueId)
            };
        }

        throw new ApplicationDomainError(`User not authorized. user=${user.email}`);
    }

    private async rejectInactiveUser(user: IUser, recoveryData: IRecoveryData): Promise<ILoginResponse> {
        logger.verbose('Inactive account failed to log in.');
        return this.activationService.prepareUserForActivation(user, recoveryData).then(
            () => {
                throw new ApplicationDomainError(`User inactive. user=${user.email}`);
            }
        );
    }
}

export function createService(userRepository: IUserRepository, activationService: IRegistrationService): ILoginService {
    return new LoginService(userRepository, activationService);
}
