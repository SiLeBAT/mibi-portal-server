import { IUser, IUserExtended } from "./../../../shared/entities";
import { tokenRepository, userRepository } from "./../../../shared/persistence";
import { logger } from "./../../../../../aspects";
import { verifyToken, getUserForToken } from './../../../shared/interactors';

export interface IActivationResponse {
    result: ActivateResult
}

export enum ActivateResult {
    FAIL, SUCCESS, EXPIRED
}

async function activateUser(token: string): Promise<IActivationResponse> {

    try {
        const userId = await getUserForToken(token);
        const userModel = await userRepository.updateUser(userId, { enabled: true, updated: Date.now() });
        // TODO this should probably be elsewhere
        if (!userModel) {
            return {
                result: ActivateResult.EXPIRED
            }
        }
        await tokenRepository.deleteTokenForUser(userId);

        return {
            result: ActivateResult.SUCCESS
        }

    } catch (err) {
        return {
            result: ActivateResult.EXPIRED
        }
    }
}

export {
    activateUser
}