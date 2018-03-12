import * as fs from 'fs';
import { getRepository, RepositoryType } from '../../../../core';
import { logger, ServerError } from './../../../../../aspects';
import { prepareUserForActivation, hashPassword, generateToken, IInstitutionRepository, ITokenRepository, IUserRepository } from './../../../shared/interactors';
import { createUser, TokenType } from '../../../shared/entities';

export interface IUserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string | string[] | undefined;
}

export interface IRegisterResponse {
    result: RegisterResult;
    email?: string;
    error?: Error;
}

export enum RegisterResult {
    FAIL, DUPLICATE, SUCCESS
}

async function registerUser(credentials: IUserRegistration): Promise<IRegisterResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const institutionRepository: IInstitutionRepository = getRepository(RepositoryType.INSTITUTION);
        const result = await userRepository.hasUser(credentials.email);
        if (result) {
            logger.info('Registration failed: User already exists: ', credentials.email);
            return {
                result: RegisterResult.DUPLICATE
            };
        }
        const hashedPassword = await hashPassword(credentials.password);
        const inst = await institutionRepository.findById(credentials.institution);
        if (!inst) {
            logger.error('Institution not found');
            throw new ServerError('Institution not found');
        }
        const newUser = createUser('0000', credentials.email, credentials.firstName,
            credentials.lastName, inst);
        newUser.password = hashedPassword;
        const user = await userRepository.createUser(newUser);

        prepareUserForActivation(user, credentials.userAgent as string);
        return {
            result: RegisterResult.SUCCESS,
            email: user.email
        };
    } catch (err) {
        logger.error('Registration failed. Reason: ', err);
        return {
            result: RegisterResult.FAIL,
            error: err
        };
    }
}

export {
    registerUser
};
