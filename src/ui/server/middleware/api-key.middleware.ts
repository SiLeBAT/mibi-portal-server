import { timingSafeEqual } from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { logger } from '../../../aspects';
import { SERVER_ERROR_CODE } from '../model/enums';
import { DefaultServerErrorDTO } from '../model/response.model';

/**
 * Header carrying the shared secret. Express lower-cases incoming header names,
 * so this is the exact key to read from `req.headers`; callers may capitalise
 * it however they like.
 */
export const API_KEY_HEADER = 'x-mibi-api-key';

/**
 * Guards a machine-to-machine route with a shared secret.
 *
 * Deliberately a middleware rather than a check inside the controller: the
 * controller then never learns how its caller was authenticated, so replacing
 * this scheme later (a technical user's JWT, a Keycloak service account) costs
 * one new middleware and one changed line in routes.ts.
 *
 * Fails closed. An environment that has configured no key rejects every
 * request rather than waving them through — behind this route sits a write
 * path that runs with the Parse master key, so a forgotten config value must
 * not silently open it.
 */
export function requireApiKey(configuredKey: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!configuredKey) {
            logger.warn(
                `Rejected ${req.method} ${req.path}: no API key is configured on this server`
            );
            rejectUnauthenticated(res);
            return;
        }

        // A repeated header arrives as an array, which is never a valid key.
        const presentedKey = req.headers[API_KEY_HEADER];
        if (
            typeof presentedKey !== 'string' ||
            !equalsInConstantTime(presentedKey, configuredKey)
        ) {
            logger.warn(
                `Rejected ${req.method} ${req.path}: missing or invalid API key`
            );
            rejectUnauthenticated(res);
            return;
        }

        next();
    };
}

/**
 * The same answer for a missing key and a wrong one: telling them apart tells
 * an attacker whether the endpoint is active on this deployment.
 */
function rejectUnauthenticated(res: Response): void {
    const dto: DefaultServerErrorDTO = {
        code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
        message: 'Not authenticated'
    };
    res.status(401).json(dto);
}

/**
 * A plain `===` returns as soon as two strings differ, so how long the answer
 * takes leaks how many leading characters were right, and a patient caller can
 * recover the key one character at a time. `timingSafeEqual` always compares
 * the whole buffer.
 *
 * The length comparison in front of it does leak the key's length; that is not
 * worth defending against, and `timingSafeEqual` throws on unequal lengths.
 */
function equalsInConstantTime(presented: string, expected: string): boolean {
    const presentedBytes = Buffer.from(presented, 'utf8');
    const expectedBytes = Buffer.from(expected, 'utf8');

    if (presentedBytes.length !== expectedBytes.length) {
        return false;
    }
    return timingSafeEqual(presentedBytes, expectedBytes);
}
