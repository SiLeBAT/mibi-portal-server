import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../aspects';
import { SERVER_ERROR_CODE } from '../model/enums';
import { DefaultServerErrorDTO } from '../model/response.model';
import { trimStrings } from '../trim-strings';

/**
 * Removes surrounding whitespace and line breaks from the strings of a request
 * body before any controller sees it.
 *
 * A body nested too deeply to walk overflows the stack. It is answered here
 * because the error middleware of the http server only responds to 401s.
 */
export function trimRequestBody(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        req.body = trimStrings(req.body);
    } catch (error) {
        logger.warn(
            `Rejected ${req.method} ${req.path}: unable to trim request body. error=${error}`
        );
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.INPUT_ERROR,
            message: 'Malformed request'
        };
        res.status(400).json(dto);
        return;
    }
    next();
}
