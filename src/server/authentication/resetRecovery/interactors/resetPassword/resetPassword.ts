import { IUserRepository, ITokenRepository, IUserEntity, sendNotificationEmail, getUserIdForToken } from './../../../shared';
import { logger } from '../../../../../aspects';
import { getRepository, RepositoryType } from '../../../../core';

export interface IResetResponse {
    result: ResetResult;
}

export enum ResetResult {
    FAIL, EXPIRED, SUCCESS
}

async function resetPassword(token: string, password: string): Promise<IResetResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
        const userId = await getUserIdForToken(token);
        let user: IUserEntity = await userRepository.getUserById(userId);
        await user.updatePassword(password);
        await userRepository.updateUser(user.uniqueId, { password: user.password });
        await tokenRepository.deleteTokenForUser(userId);
        await sendNotificationEmail(user);
        return {
            result: ResetResult.SUCCESS
        };
    } catch (err) {
        logger.error('Unable to reset password. Reason: ', err);
        return {
            result: ResetResult.EXPIRED
        };
    }
}

export {
    resetPassword
};
