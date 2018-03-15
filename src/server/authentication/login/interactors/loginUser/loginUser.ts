import { IUserRepository, prepareUserForActivation, IUserEntity, IRecoveryData, IUserCredentials, UserToken } from './../../../shared';
import { logger } from './../../../../../aspects';
import { InvalidUserError, ServerError } from './../../../../../aspects/error';
import { getRepository, RepositoryType } from '../../../../core';

export interface IUserLoginInformation extends IUserCredentials {
    userAgent: string | string[] | undefined;
    host: string | undefined;
}

export interface ILoginResponse {
    result: LoginResult;
    user?: IUserEntity;
    token?: string;

}
export enum LoginResult {
    FAIL, INACTIVE, SUCCESS
}

async function loginUser(credentials: IUserLoginInformation): Promise<ILoginResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const user = await userRepository.findByUsername(credentials.email);

        if (!user.isActivated()) {
            return rejectInactive(user, {
                userAgent: credentials.userAgent as string,
                email: user.email,
                host: credentials.host as string
            });
        }
        const authorized = await user.isAuthorized(credentials);
        if (authorized) {
            return {
                result: LoginResult.SUCCESS,
                user: user,
                token: UserToken.generateToken(user.uniqueId)
            };
        }
    } catch (err) {
        return failLogin(err);
    }

    return failLogin(new InvalidUserError());
}

function failLogin(err: Error): ILoginResponse {
    logger.verbose('Failed to log in: ', err);
    return {
        result: LoginResult.FAIL,
        user: undefined
    };
}

function rejectInactive(user: IUserEntity, recoveryData: IRecoveryData): ILoginResponse {
    logger.verbose('Inactive account failed to log in.');
    prepareUserForActivation(user, recoveryData).then(
        () => undefined,
        err => {
            throw new ServerError(`Unable to prepare user for activation user.uniquId=${user.uniqueId}, error=${err}`);
        }
    );
    return {
        result: LoginResult.INACTIVE,
        user: undefined
    };
}

export {
    loginUser
};
