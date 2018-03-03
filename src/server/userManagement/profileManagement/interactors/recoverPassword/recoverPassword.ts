import * as fs from 'fs';
import { userRepository, tokenRepository } from "./../../../shared/persistence";
import { logger } from "./../../../../../aspects";
import { sendResetHelpEmail, sendResetEmail } from './../../../shared/interactors';
import { generateToken } from './../../../shared/interactors';

export interface IRecoveryData {
    email: string;
    host: string;
    userAgent: string;
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
        const exists = await userRepository.hasUser(recoveryData.email);
        if (!exists) {
            const templateFile = fs.readFileSync(__dirname + '/../../views/pwresethelp.html').toString('utf-8');
            sendResetHelpEmail(recoveryData.email, recoveryData.host, recoveryData.userAgent, templateFile);
            return {
                result: RecoverResult.SUCCESS,
                email: recoveryData.email
            }
        }
        const user = await userRepository.findByUsername(recoveryData.email);
        const oldToken = await tokenRepository.hasTokenForUser(user._id);
        if (oldToken) {
            await tokenRepository.deleteTokenForUser(user._id);
        }
        const token = generateToken(user._id);
        const resetToken = await tokenRepository.saveToken({
            token: token,
            type: 'reset',
            user: user._id
        });
        const templateFile = fs.readFileSync(__dirname + '/../views/pwreset.html').toString('utf-8');
        sendResetEmail(user, resetToken, recoveryData.userAgent, templateFile);
        return {
            result: RecoverResult.SUCCESS,
            email: recoveryData.email
        }
    }
    catch (err) {
        return {
            result: RecoverResult.FAIL,
            email: recoveryData.email
        }
    }
}

export {
    recoverPassword
}