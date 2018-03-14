import { getRepository, RepositoryType } from '../../../../core';
import { verifyToken } from './../auth';
import { InvalidTokenError } from './../../../../../aspects';
import { ITokenRepository } from '..';

async function getUserIdForToken(token: string): Promise<string> {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
    const tokenEntry = await tokenRepository.getToken(token);

    const resetToken = tokenEntry;
    const userId = String(resetToken.user);
    try {
        verifyToken(token, userId);
    } catch (err) {
        throw new InvalidTokenError(`Error validating token for user, token=${token}, userId=${userId}, error=${err}`);
    }
    return userId;
}

export {
    getUserIdForToken
};
