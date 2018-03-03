import * as fs from 'fs';
import { userRepository, tokenRepository } from "./../../../shared/persistence";
import { logger } from "./../../../../../aspects";
import { sendNotificationEmail } from './../../../shared/interactors';
import { hashPassword } from './../../../shared/interactors';
import { getUserForToken } from './../../../shared/interactors';
import { IUser } from "./../../../shared/entities";

export interface IResetResponse {
    result: ResetResult;
}

export enum ResetResult {
    FAIL, EXPIRED, SUCCESS
}

async function resetPassword(token: string, password: string): Promise<IResetResponse> {

    try {
        const userId = await getUserForToken(token);
        const hashedPassword = await hashPassword(password);
        const user: IUser = await userRepository.updateUser(userId, { enabled: true, updated: Date.now() });
        // TODO this should probably be elsewhere
        if (!user) {
            return {
                result: ResetResult.EXPIRED
            }
        }
        await tokenRepository.deleteTokenForUser(userId);
        const templateFile = fs.readFileSync(__dirname + '/../views/pwnotification.html').toString('utf-8');
        sendNotificationEmail(user, templateFile);
        return {
            result: ResetResult.SUCCESS
        }
    }
    catch (err) {
        return {
            result: ResetResult.EXPIRED
        }
    }
}

export {
    resetPassword
}