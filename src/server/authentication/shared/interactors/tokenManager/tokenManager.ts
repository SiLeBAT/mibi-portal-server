import { getRepository, RepositoryType, InvalidTokenError } from '../../../../core';
import { ITokenRepository } from './../../gateway';
import { UserToken } from '../..';

// TODO: probably remove this and shift logic into Token entity
async function getUserIdForToken(token: string): Promise<string> {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);
    const tokenEntry = await tokenRepository.getToken(token);

    const resetToken = tokenEntry;
    const userId = String(resetToken.user);
    try {
        UserToken.verifyToken(token, userId);
    } catch (err) {
        throw new InvalidTokenError(`Error validating token for user, token=${token}, userId=${userId}, error=${err}`);
    }
    return userId;
}

export {
    getUserIdForToken
};
