import * as fs from 'fs';
import { sendNotificationEmail,hashPassword, getUserIdForToken, IUserRepository, ITokenRepository } from './../../../shared/interactors';
import { IUserEntity } from './../../../shared/entities';
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
        const hash = await hashPassword(password);
        const user: IUserEntity = await userRepository.updateUser(userId, { password: hash });
        // TODO this should probably be elsewhere
        if (!user) {
            return {
                result: ResetResult.EXPIRED
            };
        }
        await tokenRepository.deleteTokenForUser(userId);
        const templateFile = fs.readFileSync(__dirname + '/../../views/pwnotification.html').toString('utf-8');
        sendNotificationEmail(user, templateFile);
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
