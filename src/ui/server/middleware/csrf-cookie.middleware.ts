import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * csrf-csrf's `generateToken`, narrowed to the arguments this middleware passes.
 */
export type CsrfTokenGenerator = (
    req: Request,
    res: Response,
    overwrite?: boolean,
    validateOnReuse?: boolean
) => string;

/**
 * Makes sure a browser that performs a GET ends up with an XSRF-TOKEN cookie,
 * so Angular's HttpClientXsrfModule can copy it into the X-XSRF-TOKEN header of
 * the next unsafe request.
 *
 * The cookie is set but deliberately NOT rotated. csrf-csrf compares the header
 * of an incoming POST against the token in the cookie the browser sent along
 * with that same POST, and Angular reads the cookie when it builds the request,
 * not when it goes out. A token that changes in between therefore fails that
 * comparison. A page load fires several GETs concurrently with the
 * POST /v2/tokens session refresh, which is exactly that situation: rotating
 * here made the refresh 403 and logged the user out on every reload.
 *
 * `overwrite: false` keeps a cookie that is still valid, and
 * `validateOnReuse: false` quietly replaces an unusable one (e.g. issued under
 * a previous session secret) rather than throwing, which would reject plain
 * GETs and lock that browser out until it cleared its cookies.
 */
export function ensureCsrfCookie(
    generateToken: CsrfTokenGenerator
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
            generateToken(req, res, false, false);
        }
        next();
    };
}
