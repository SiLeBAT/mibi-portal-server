import { verifyPassword } from './../../../shared/interactors/auth';
import { generateToken } from './../../../shared/interactors/auth';
import { IUser, IUserExtended } from "./../../../shared//entities/user";
import { userRepository } from "./../../../shared/persistence";
import { logger } from "./../../../../../aspects/logging";
import { InvalidUserError } from './../../../../../aspects/error';

export interface IUserCredentials {
    email: string;
    password: string;
}

export interface ILoginResponse {
    result: LoginResult;
    user?: IUserExtended;
    token?: string;

}
export enum LoginResult {
    FAIL, INACTIVE, SUCCESS
}

async function loginUser(credentials: IUserCredentials): Promise<ILoginResponse> {
    let user;

    try {
        // FIXME: Should only find user not user with aux data.
        user = await userRepository.findByUsernameWithAuxilliary(credentials.email);

        if (!user.isActivated()) {
            return rejectInactive();
        }
        const authorized = await checkIfAuthorized(user, credentials);
        if (authorized) {
            return {
                result: LoginResult.SUCCESS,
                user: user,
                token: generateToken(user._id)
            }
        }
    } catch (err) {
        return failLogin(err);
    }

    return failLogin(new InvalidUserError());
}

function checkIfAuthorized(user: IUser, credentials: IUserCredentials): Promise<boolean> {
    return userRepository.getPasswordForUser(user.email).then(
        hashedPassword => {
            return verifyPassword(hashedPassword, credentials.password);
        },
        () => {
            return Promise.reject(false);
        }
    );
}

function failLogin(err): ILoginResponse {
    logger.info("Failed to log in: ", err);
    return {
        result: LoginResult.FAIL,
        user: null
    };
}

function rejectInactive(): ILoginResponse {
    logger.info("Inactive account failed to log in.");
    return {
        result: LoginResult.INACTIVE,
        user: null
    }
}

export {
    loginUser
}