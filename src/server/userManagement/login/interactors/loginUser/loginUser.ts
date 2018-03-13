import { verifyPassword, generateToken, IUserRepository, prepareUserForActivation } from './../../../shared/interactors';
import { IUserEntity } from './../../../shared//entities';
import { logger } from './../../../../../aspects/logging';
import { InvalidUserError, ServerError } from './../../../../../aspects/error';
import { getRepository } from '../../../../core';
import { RepositoryType } from '../../../../core/persistence/repositoryProvider';

export interface IUserCredentials {
    email: string;
    password: string;
    userAgent: string | string[] | undefined;
}

export interface ILoginResponse {
    result: LoginResult;
    user?: IUserEntity;
    token?: string;

}
export enum LoginResult {
    FAIL, INACTIVE, SUCCESS
}

async function loginUser(credentials: IUserCredentials): Promise<ILoginResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const user = await userRepository.findByUsername(credentials.email);

        if (!user.isActivated()) {
            return rejectInactive(user, credentials.userAgent as string);
        }
        const authorized = await checkIfAuthorized(user, credentials);
        if (authorized) {
            return {
                result: LoginResult.SUCCESS,
                user: user,
                token: generateToken(user.uniqueId)
            };
        }
    } catch (err) {
        return failLogin(err);
    }

    return failLogin(new InvalidUserError());
}

function checkIfAuthorized(user: IUserEntity, credentials: IUserCredentials): Promise<boolean> {
    const userRepository: IUserRepository = getRepository(RepositoryType.USER);
    return userRepository.getPasswordForUser(user.email).then(
        (hashedPassword: string) => {
            return verifyPassword(hashedPassword, credentials.password);
        },
        () => {
            return Promise.reject(false);
        }
    );
}

function failLogin(err: Error): ILoginResponse {
    logger.verbose('Failed to log in: ', err);
    return {
        result: LoginResult.FAIL,
        user: undefined
    };
}

function rejectInactive(user: IUserEntity, userAgent: string): ILoginResponse {
    logger.verbose('Inactive account failed to log in.');
    prepareUserForActivation(user, userAgent).then(
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
