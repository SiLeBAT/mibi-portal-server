import * as fs from 'fs';
import { sendResetHelpEmail, sendResetEmail, generateToken, IUserRepository, ITokenRepository } from './../../../shared/interactors';
import { TokenType } from '../../../shared/entities';
import { logger } from '../../../../../aspects';
import { getRepository, RepositoryType } from '../../../../core';

export interface IRecoveryData {
    email: string;
    host: string | undefined;
    userAgent: string | undefined | string[];
}

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
            const templateFile = fs.readFileSync(__dirname + '/../../views/pwresethelp.html').toString('utf-8');
            sendResetHelpEmail(recoveryData.email, (recoveryData.host as string), (recoveryData.userAgent as string), templateFile);
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
        const token = generateToken(user.uniqueId);
        const resetToken = await tokenRepository.saveToken({
            token: token,
            type: TokenType.RESET,
            user: user.uniqueId
        });
        const templateFile = fs.readFileSync(__dirname + '/../../views/pwreset.html').toString('utf-8');
        sendResetEmail(user, resetToken, (recoveryData.userAgent as string), templateFile);
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
