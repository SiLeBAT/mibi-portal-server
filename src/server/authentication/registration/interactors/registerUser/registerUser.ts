import { getRepository, RepositoryType } from '../../../../core';
import { logger, ServerError } from './../../../../../aspects';
import { IInstitutionRepository, IUserRepository } from './../../../shared';
import { prepareUserForActivation } from './../../../shared/interactors';
import { createUser } from '../../../shared/entities';

export interface IUserRegistration {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    institution: string;
    userAgent: string;
    host: string;
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

    const userRepository: IUserRepository = getRepository(RepositoryType.USER);
    const institutionRepository: IInstitutionRepository = getRepository(RepositoryType.INSTITUTION);
    const result = await userRepository.hasUser(credentials.email);
    if (result) {
        logger.info('Registration failed: User already exists: ', credentials.email);
        return {
            result: RegisterResult.DUPLICATE
        };
    }
    const inst = await institutionRepository.findById(credentials.institution);
    if (!inst) {
        throw new ServerError(`Institution not found, id=${credentials.institution}`);
    }
    const newUser = createUser('0000', credentials.email, credentials.firstName,
        credentials.lastName, inst, '');

    await newUser.updatePassword(credentials.password);
    const user = await userRepository.createUser(newUser);

    return prepareUserForActivation(user, {
        userAgent: credentials.userAgent,
        email: user.email,
        host: credentials.host
    }).then(
        () => ({
            result: RegisterResult.SUCCESS,
            email: user.email
        })
    );
}

export {
    registerUser
};
