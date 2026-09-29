/// <reference types='jest' />

import { NextFunction, Request, Response } from 'express';
import { doubleCsrf } from 'csrf-csrf';
import { ensureCsrfCookie } from '../csrf-cookie.middleware';

const COOKIE_NAME = 'XSRF-TOKEN';
const SECRET = 'a-test-session-secret';

/**
 * The csrf-csrf instance is configured exactly as express.setup.ts configures
 * it, so these tests exercise the real token/cookie pairing rather than a
 * stand-in for it.
 */
function buildCsrf(secret: string = SECRET) {
    return doubleCsrf({
        getSecret: () => secret,
        cookieName: COOKIE_NAME,
        cookieOptions: { httpOnly: false, sameSite: 'lax', secure: false },
        getTokenFromRequest: req => {
            const header = req.headers['x-xsrf-token'] as string | undefined;
            return header ? header.split('|')[0] : '';
        }
    });
}

/**
 * Minimal stand-in for a browser: it attaches its cookie jar to every request
 * it sends and applies Set-Cookie from the response, which is what makes the
 * ordering in the reload test below meaningful.
 */
class Browser {
    private jar: Record<string, string> = {};

    get csrfCookie(): string | undefined {
        return this.jar[COOKIE_NAME];
    }

    setCookie(value: string): void {
        this.jar[COOKIE_NAME] = value;
    }

    send(method: string, header?: string): { req: Request; res: Response } {
        const req = {
            method: method,
            cookies: { ...this.jar },
            headers: header === undefined ? {} : { 'x-xsrf-token': header }
        } as unknown as Request;
        const res = {
            cookie: (name: string, value: string) => {
                this.jar[name] = value;
            }
        } as unknown as Response;
        return { req: req, res: res };
    }
}

function run(
    middleware: ReturnType<typeof ensureCsrfCookie>,
    exchange: { req: Request; res: Response }
): NextFunction {
    const next = jest.fn() as unknown as NextFunction;
    middleware(exchange.req, exchange.res, next);
    return next;
}

describe('ensureCsrfCookie middleware', () => {
    it('issues an XSRF-TOKEN cookie on a GET when the browser has none', () => {
        const { generateToken } = buildCsrf();
        const browser = new Browser();

        const next = run(ensureCsrfCookie(generateToken), browser.send('GET'));

        expect(browser.csrfCookie).toBeDefined();
        expect(next).toHaveBeenCalledWith();
    });

    it('does not rotate a valid cookie on subsequent GETs', () => {
        const { generateToken } = buildCsrf();
        const middleware = ensureCsrfCookie(generateToken);
        const browser = new Browser();

        run(middleware, browser.send('GET'));
        const first = browser.csrfCookie;
        run(middleware, browser.send('GET'));
        run(middleware, browser.send('GET'));

        expect(browser.csrfCookie).toBe(first);
    });

    it('keeps a POST valid when concurrent GETs touch the cookie in between', () => {
        // This is the page reload: the client stamps X-XSRF-TOKEN from the
        // cookie when it builds POST /v2/tokens, but the request only leaves
        // the browser after the GETs of the same page load have come back. A
        // cookie rotated by those GETs no longer matches the stamped header,
        // csrf-csrf rejects the refresh with 403, and the client used to read
        // that as "no longer logged in".
        const { generateToken, validateRequest } = buildCsrf();
        const middleware = ensureCsrfCookie(generateToken);
        const browser = new Browser();

        run(middleware, browser.send('GET'));
        // The client reads the cookie here and sends the whole value as header.
        const stampedHeader = browser.csrfCookie as string;

        // Further GETs of the same page load (institutes, nrls, the version
        // check, ...) pass through the middleware while the POST is pending.
        run(middleware, browser.send('GET'));
        run(middleware, browser.send('GET'));

        const refresh = browser.send('POST', stampedHeader);

        expect(validateRequest(refresh.req)).toBe(true);
    });

    it('leaves the cookie alone on unsafe methods', () => {
        const { generateToken } = buildCsrf();
        const middleware = ensureCsrfCookie(generateToken);
        const browser = new Browser();

        run(middleware, browser.send('GET'));
        const issued = browser.csrfCookie;

        run(middleware, browser.send('POST', issued));
        run(middleware, browser.send('PUT', issued));

        expect(browser.csrfCookie).toBe(issued);
    });

    it('replaces an unusable cookie instead of rejecting the GET', () => {
        // A cookie left over from a previous session secret cannot be reused.
        // Throwing here would 403 plain page loads, so it has to be replaced.
        const { generateToken, validateRequest } = buildCsrf();
        const middleware = ensureCsrfCookie(generateToken);
        const browser = new Browser();
        browser.setCookie('stale-token|stale-hash');

        const exchange = browser.send('GET');
        expect(() => run(middleware, exchange)).not.toThrow();

        expect(browser.csrfCookie).not.toBe('stale-token|stale-hash');
        const post = browser.send('POST', browser.csrfCookie as string);
        expect(validateRequest(post.req)).toBe(true);
    });
});
