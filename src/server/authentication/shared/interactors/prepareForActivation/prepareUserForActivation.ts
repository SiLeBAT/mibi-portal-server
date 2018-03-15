import { sendActivationEmail } from './../sendMail';
import { IUserEntity, TokenType, UserToken } from '../../entities';
import { ITokenRepository } from '../../gateway';
import { getRepository, RepositoryType } from '../../../../core';
import { logger } from '../../../../../aspects';
import { IRecoveryData } from '../sendMail';

async function prepareUserForActivation(user: IUserEntity, recoveryData: IRecoveryData) {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);

    deleteOldTokensForUser(user, tokenRepository).then(
        successfullyDeleted => {
            if (!successfullyDeleted) {
                logger.warn('An error occured deleting token in DB for user, user.uniqueId=' + user.uniqueId);
            }
        },
        fail => { logger.warn('An error occured deleting token in DB for user, user.uniqueId=' + user.uniqueId); }
    );

    const token = UserToken.generateToken(user.uniqueId);

    const activationToken = await tokenRepository.saveToken({
        token: token,
        type: TokenType.ACTIVATE,
        user: user.uniqueId
    });

    await sendActivationEmail(user, activationToken, {
        userAgent: recoveryData.userAgent,
        host: recoveryData.host,
        email: user.email
    });
}

async function deleteOldTokensForUser(user: IUserEntity, tokenRepository: ITokenRepository): Promise<boolean> {
    const hasOldToken = await tokenRepository.tokenForUserExists(user.uniqueId);
    if (hasOldToken) {
        return tokenRepository.deleteTokenForUser(user.uniqueId);
    }
    return true;
}

export {
    prepareUserForActivation
};
