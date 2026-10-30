import express, { Response } from 'express';
import { AddressInfo } from 'net';
import { buildControllerRouter } from '../routes';
import { Controllers } from '../server.factory';

// Every controller method answers with its own name, so a request shows which
// handler, if any, the router picked.
const controllers = new Proxy(
    {},
    {
        get: (_target, controller) =>
            new Proxy(
                {},
                {
                    get:
                        (_t, method) =>
                        (...args: unknown[]) => {
                            const res = args.find(
                                a => typeof (a as Response)?.json === 'function'
                            ) as Response;
                            res.json({
                                handler: `${String(controller)}.${String(
                                    method
                                )}`
                            });
                        }
                }
            )
    }
) as Controllers;

async function request(apiVersionRoute: string, path: string) {
    const app = express().use(
        buildControllerRouter(controllers, 'key', apiVersionRoute)
    );
    const server = app.listen(0);
    try {
        const { port } = server.address() as AddressInfo;
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        return {
            status: response.status,
            body: response.status === 200 ? await response.json() : undefined
        };
    } finally {
        server.close();
    }
}

describe('buildControllerRouter', () => {
    it('serves the routes below the configured api version', async () => {
        expect(await request('/v2', '/v2/info')).toEqual({
            status: 200,
            body: { handler: 'systemInfo.getSystemInfo' }
        });
    });

    it('serves the version root at the version itself', async () => {
        expect(await request('/v2', '/v2')).toEqual({
            status: 200,
            body: { handler: 'versionRoot.getAPIDefinition' }
        });
    });

    it('follows a changed api version', async () => {
        expect((await request('/v3', '/v3/nrls')).body).toEqual({
            handler: 'nrls.getNRLs'
        });
        expect((await request('/v3', '/v2/nrls')).status).toBe(404);
    });
});
