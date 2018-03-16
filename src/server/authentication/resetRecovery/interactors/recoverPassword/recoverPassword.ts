import { TokenType, IUserRepository, ITokenRepository, sendResetHelpEmail, sendResetEmail, IRecoveryData, UserToken } from './../../../shared';
import { logger } from '../../../../../aspects';
import { getRepository, RepositoryType } from '../../../../core';

export interface IRecoverResponse {
    result: RecoverResult;
    email: string;
}

export enum RecoverResult {
    FAIL, SUCCESS
}

async function recoverPassword(recoveryData: IRecoveryData): Promise<IRecoverResponse> {

    try {
        const userRepository: IUserRepository = getRepository(RepositoryType.USER);
        const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
        const exists = await userRepository.hasUser(recoveryData.email);
        if (!exists) {
            await sendResetHelpEmail({
                email: recoveryData.email,
                userAgent: (recoveryData.userAgent),
                host: (recoveryData.host)
            });

            return {
                result: RecoverResult.SUCCESS,
                email: recoveryData.email
            };
        }
        const user = await userRepository.findByUsername(recoveryData.email);
        const hasOldToken = await tokenRepository.tokenForUserExists(user.uniqueId);
        if (hasOldToken) {
            await tokenRepository.deleteTokenForUser(user.uniqueId);
        }
        const token = UserToken.generateToken(user.uniqueId);
        const resetToken = await tokenRepository.saveToken({
            token: token,
            type: TokenType.RESET,
            user: user.uniqueId
        });
        await sendResetEmail(user, resetToken, {
            email: user.email,
            userAgent: (recoveryData.userAgent),
            host: (recoveryData.host)
        });

        return {
            result: RecoverResult.SUCCESS,
            email: recoveryData.email
        };
    } catch (err) {
        logger.error('Unable to recover password. Reason: ', err);
        return {
            result: RecoverResult.FAIL,
            email: recoveryData.email
        };
    }
}

export {
    recoverPassword
};
