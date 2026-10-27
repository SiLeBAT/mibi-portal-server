import { NextFunction, Request, Response } from 'express';
import {
    bearer,
    expiredTestToken,
    signTestToken,
    tamperedTestToken,
    TEST_JWT_SECRET,
    unsignedTestToken
} from '../../../../__mocks__/jwt';
import {
    getTokenFromHeader,
    validateToken
} from '../token-validator.middleware';

const API_ROUTE = '/v2';

function mockRequest(url: string): Request {
    return {
        method: 'POST',
        url,
        originalUrl: url,
        path: url,
        headers: {}
    } as unknown as Request;
}

async function runGuard(url: string): Promise<unknown[][]> {
    const next: NextFunction = jest.fn();
    const guard = validateToken(API_ROUTE, 'a-secret');

    // expressjwt returns a promise, and express-unless returns undefined when
    // the path is skipped, so normalise before awaiting.
    await Promise.resolve(
        guard(mockRequest(url), {} as Response, next) as unknown
    );
    // It signals a rejected token by calling next(error) rather than by
    // rejecting, and does so one tick after that promise settles - without
    // this the calls array is still empty.
    await new Promise(resolve => setImmediate(resolve));

    return (next as jest.Mock).mock.calls;
}

describe('validateToken whitelist', () => {
    it('lets the results import through without a JWT', async () => {
        // It carries an API key instead, checked by requireApiKey on the route.
        // Without this whitelist entry expressjwt would answer 401 before that
        // middleware ever runs.
        const calls = await runGuard('/v2/orders/results');

        expect(calls).toEqual([[]]);
    });

    it('still guards a route that is not whitelisted', async () => {
        const calls = await runGuard('/v2/samples/submitted');

        expect(calls).toHaveLength(1);
        expect(calls[0][0]).toBeInstanceOf(Error);
        expect((calls[0][0] as Error).message).toContain(
            'No authorization token was found'
        );
    });
});

const API_ROOT = '/v2';

describe('getTokenFromHeader', () => {
    function withAuthorization(authorization?: string): Request {
        return {
            headers: authorization ? { authorization } : {}
        } as Request;
    }

    it('returns the token of a Bearer header', () => {
        expect(getTokenFromHeader(withAuthorization('Bearer abc.def'))).toBe(
            'abc.def'
        );
    });

    it.each([
        ['no Authorization header', undefined],
        ['a Basic header', 'Basic dXNlcjpwdw=='],
        ['a lowercase bearer scheme', 'bearer abc.def'],
        ['a token without a scheme', 'abc.def']
    ])('returns null for %s', (_case, authorization) => {
        expect(getTokenFromHeader(withAuthorization(authorization))).toBeNull();
    });
});

describe('validateToken', () => {
    const middleware = validateToken(API_ROOT, TEST_JWT_SECRET);

    // Called the way http-server.ts does. express-jwt reports a bad token as
    // next(err) from a setImmediate, so wait for next instead of the promise;
    // the error handler in http-server.ts turns that error into a 401.
    async function run(method: string, path: string, authorization?: string) {
        const req = {
            method,
            url: path,
            originalUrl: path,
            headers: authorization ? { authorization } : {}
        } as unknown as Request & { auth?: { sub?: string } };
        const next = jest.fn();
        await new Promise<void>(resolve => {
            next.mockImplementation(() => resolve());
            middleware(req, {} as Response, next).catch(next);
        });
        return { req, next };
    }

    function expectRejected(next: jest.Mock) {
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                name: 'UnauthorizedError',
                status: 401
            })
        );
    }

    function expectPassed(next: jest.Mock) {
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    }

    // Routes that only the middleware protects: their controllers do not
    // check a token themselves.
    const PROTECTED_ROUTES: [string, string][] = [
        ['POST', '/v2/tokens'],
        ['PATCH', '/v2/users/email-notifications'],
        ['PUT', '/v2/zomo-plan-file/download'],
        ['POST', '/v2/samples/submitted'],
        ['GET', '/v2/admin/actors/pending'],
        ['POST', '/v2/admin/actors/kc-sub-1/enable'],
        ['POST', '/v2/admin/actors/kc-sub-1/disable']
    ];

    describe.each(PROTECTED_ROUTES)('protected route %s %s', (method, path) => {
        it('rejects a request without a token', async () => {
            const { next } = await run(method, path);

            expectRejected(next);
            expect(next.mock.calls[0][0].code).toBe('credentials_required');
        });

        it.each([
            ['a non-Bearer scheme', `Basic ${signTestToken()}`],
            ['a token that is not a JWT', bearer('not-a-jwt')],
            [
                'a token signed with another secret',
                bearer(signTestToken('user-1', {}, 'other-secret'))
            ],
            ['an expired token', bearer(expiredTestToken())],
            ['an unsigned (alg=none) token', bearer(unsignedTestToken())],
            [
                'a token signed with another algorithm',
                bearer(signTestToken('user-1', { algorithm: 'HS512' }))
            ],
            ['a token with a tampered payload', bearer(tamperedTestToken())]
        ])('rejects %s', async (_case, authorization) => {
            const { next } = await run(method, path, authorization);

            expectRejected(next);
        });

        it('passes a valid token and exposes its payload as req.auth', async () => {
            const { req, next } = await run(
                method,
                path,
                bearer(signTestToken('user-1'))
            );

            expectPassed(next);
            expect(req.auth?.sub).toBe('user-1');
        });
    });

    // Public routes, and routes whose controllers authenticate the request
    // themselves (orders, samples, consent, Keycloak).
    const WHITELISTED_ROUTES: [string, string][] = [
        ['GET', '/v2'],
        ['GET', '/v2/'],
        ['GET', '/v2/info'],
        ['GET', '/v2/institutes'],
        ['GET', '/v2/nrls'],
        ['GET', '/v2/client-dashboard-info'],
        ['GET', '/v2/zomo-plan-file'],
        ['POST', '/v2/users/login'],
        ['POST', '/v2/users/registration'],
        ['PUT', '/v2/users/reset-password-request'],
        ['PATCH', '/v2/users/reset-password/reset-token'],
        ['PATCH', '/v2/users/verification/verification-token'],
        ['PATCH', '/v2/users/activation/activation-token'],
        ['PATCH', '/v2/users/consent'],
        ['PUT', '/v2/samples'],
        ['PUT', '/v2/samples/validated'],
        ['GET', '/v2/orders'],
        ['DELETE', '/v2/orders'],
        ['POST', '/v2/orders/samples-with-results'],
        ['POST', '/v2/orders/results'],
        ['GET', '/v2/auth/login'],
        ['GET', '/v2/auth/callback'],
        ['GET', '/v2/auth/me'],
        ['POST', '/v2/auth/logout']
    ];

    describe.each(WHITELISTED_ROUTES)(
        'whitelisted route %s %s',
        (method, path) => {
            it('passes without a token', async () => {
                const { req, next } = await run(method, path);

                expectPassed(next);
                expect(req.auth).toBeUndefined();
            });

            it('passes even with an invalid token, leaving it to the controller', async () => {
                const { next } = await run(
                    method,
                    path,
                    bearer(expiredTestToken())
                );

                expectPassed(next);
            });
        }
    );

    describe('whitelist matching', () => {
        it('ignores the query string', async () => {
            const { next } = await run('GET', '/v2/info?lang=de');

            expectPassed(next);
        });

        it('does not let a whitelisted path in the query string open a protected route', async () => {
            const { next } = await run('POST', '/v2/tokens?next=/v2/info');

            expectRejected(next);
        });

        it.each([
            ['a sub path of a public route', '/v2/institutes/1'],
            ['a sub path of /orders', '/v2/orders/order-1'],
            ['a sub path of /samples', '/v2/samples/submitted'],
            ['a sub path of /users/consent', '/v2/users/consent/other'],
            ['the same path under another API root', '/v3/info']
        ])('protects %s', async (_case, path) => {
            const { next } = await run('GET', path);

            expectRejected(next);
        });
    });
});
