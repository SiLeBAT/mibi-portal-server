import * as fs from 'fs';
import { sendActivationEmail } from './../sendMail';
import { IUserEntity, TokenType } from '../../entities';
import { ITokenRepository, generateToken } from '..';
import { getRepository, RepositoryType } from '../../../../core';

async function prepareUserForActivation(user: IUserEntity, userAgent: string) {
    const tokenRepository: ITokenRepository = getRepository(RepositoryType.TOKEN);

    deleteOldTokensForUser(user, tokenRepository);

    const token = generateToken(user.uniqueId);

    const activationToken = await tokenRepository.saveToken({
        token: token,
        type: TokenType.ACTIVATE,
        user: user.uniqueId
    });

    const templateFile = fs.readFileSync(__dirname + '/../../views/regactivation.html').toString('utf-8');
    sendActivationEmail(user, activationToken, userAgent, templateFile);
}

async function deleteOldTokensForUser(user: IUserEntity, tokenRepository: ITokenRepository) {
    const hasOldToken = await tokenRepository.tokenForUserExists(user.uniqueId);
    if (hasOldToken) {
        await tokenRepository.deleteTokenForUser(user.uniqueId);
    }
}

export {
    prepareUserForActivation
};
