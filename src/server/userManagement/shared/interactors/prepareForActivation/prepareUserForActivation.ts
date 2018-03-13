import * as fs from 'fs';
import { sendActivationEmail } from './../sendMail';
import { IUserEntity, TokenType } from '../../entities';
import { ITokenRepository, generateToken } from '..';
import { getRepository, RepositoryType } from '../../../../core';
import { logger } from '../../../../../aspects';

async function prepareUserForActivation(user: IUserEntity, userAgent: string) {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);

    deleteOldTokensForUser(user, tokenRepository).then(
        successfullyDeleted => {
            if (!successfullyDeleted) {
                logger.warn('An error occured deleting token in DB for user, user.uniqueId=' + user.uniqueId);
            }
        },
        fail => { logger.warn('An error occured deleting token in DB for user, user.uniqueId=' + user.uniqueId); }
    );

    const token = generateToken(user.uniqueId);

    const activationToken = await tokenRepository.saveToken({
        token: token,
        type: TokenType.ACTIVATE,
        user: user.uniqueId
    });

    const templateFile = fs.readFileSync(__dirname + '/../../views/regactivation.html').toString('utf-8');
    sendActivationEmail(user, activationToken, userAgent, templateFile);
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
