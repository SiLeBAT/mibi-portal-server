import { getRepository, RepositoryType } from '../../../../core';
import { verifyToken } from './../auth';
import { logger, InvalidTokenError } from './../../../../../aspects';
import { ITokenRepository } from '..';

async function getUserIdForToken(token: string): Promise<string> {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
    const tokenEntry = await tokenRepository.getToken(token);

    const resetToken = tokenEntry;
    const userId = String(resetToken.user);
    try {
        await verifyToken(token, userId);
    } catch (err) {

        if (err.name === 'JsonWebTokenError') {
            logger.error(`${err.name} ${err.message}`);
        }
        if (err.name === 'TokenExpiredError') {
            logger.error(`${err.name} ${err.message}`, err.expiredAt);
        }

        throw new InvalidTokenError();
    }
    return userId;
}

export {
    getUserIdForToken
};
