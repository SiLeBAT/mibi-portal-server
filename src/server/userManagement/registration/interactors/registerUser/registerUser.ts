import * as fs from 'fs';
import { IUser, IUserExtended } from "./../../../shared/entities";
import { tokenRepository, userRepository } from "./../../../shared/persistence";
import { logger, ServerError } from "./../../../../../aspects";
import { hashPassword, generateToken, sendActivationEmail } from './../../../shared/interactors';

export interface IUserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
}

export interface IRegisterResponse {
    result: RegisterResult;
    email?: string;
    error?: Error
}

export enum RegisterResult {
    FAIL, DUPLICATE, SUCCESS
}

async function registerUser(credentials: IUserRegistration): Promise<IRegisterResponse> {

    try {
        const result = await userRepository.hasUser(credentials.email);
        if (result) {
            logger.info("Registration failed: User already exists: ", credentials.email);
            return {
                result: RegisterResult.DUPLICATE
            }
        }
        const hashedPassword = await hashPassword(credentials.password)
        const user = await userRepository.saveUser({
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            email: credentials.email,
            password: hashedPassword,
            institution: credentials.institution
        });

        const oldToken = await tokenRepository.hasTokenForUser(user._id);
        if (oldToken) {
            await tokenRepository.deleteTokenForUser(user._id);
        }
        const token = generateToken(user._id)

        const activationToken = await tokenRepository.saveToken({
            token: token,
            type: 'activate',
            user: user._id
        });
        // FIXME
        const templateFile = fs.readFileSync(__dirname + '/../../views/regactivation.html').toString('utf-8');
        sendActivationEmail(user, activationToken, credentials.userAgent, templateFile);
        return {
            result: RegisterResult.SUCCESS,
            email: user.email
        };
    } catch (err) {
        logger.error("Registration failed. Reason: ", err);
        return {
            result: RegisterResult.FAIL,
            error: err
        }
    }
}

export {
    registerUser
}