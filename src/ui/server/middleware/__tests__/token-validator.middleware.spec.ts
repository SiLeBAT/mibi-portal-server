import { NextFunction, Request, Response } from 'express';
import { validateToken } from '../token-validator.middleware';

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
