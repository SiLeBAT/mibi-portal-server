import { getUserIdForToken } from './../../../shared/interactors';
import { IUserRepository, ITokenRepository } from './../../../shared';
import { IUserEntity } from '../../../shared/entities';
import { logger } from '../../../../../aspects';
import { getRepository, RepositoryType } from '../../../../core';

export interface IActivationResponse {
    result: ActivateResult;
}

export enum ActivateResult {
    FAIL, SUCCESS, EXPIRED
}

async function activateUser(token: string): Promise<IActivationResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
        const userId = await getUserIdForToken(token);
        const user: IUserEntity = await userRepository.getUserById(userId);
        user.isActivated(true);
        await userRepository.updateUser(userId, { enabled: true });
        await tokenRepository.deleteTokenForUser(userId);
        logger.verbose('User activation successful');
        return {
            result: ActivateResult.SUCCESS
        };

    } catch (err) {
        logger.error('Unable to activate user. Reason:' , err);
        return {
            result: ActivateResult.EXPIRED
        };
    }
}

export {
    activateUser
};
