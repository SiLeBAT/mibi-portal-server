import { tokenRepository } from "./../../persistence";
import { verifyToken } from './../auth';
import { logger } from "./../../../../../aspects";
import { InvalidUserError, InvalidTokenError } from "./../../../../../aspects";

async function getUserForToken(token: string): Promise<string> {
    const tokenEntry = await tokenRepository.getToken(token);
    if (tokenEntry.length === 0) {
        throw new InvalidTokenError();
    }

    const resetToken = tokenEntry[0];
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
    getUserForToken
}