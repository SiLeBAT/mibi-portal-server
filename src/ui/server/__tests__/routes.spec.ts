import express, { Request, Response } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import axios from 'axios';
import { API_KEY_HEADER } from '../middleware/api-key.middleware';
import { buildControllerRouter } from '../routes';
import { Controllers } from '../server.factory';

jest.mock('../../../aspects', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        verbose: jest.fn()
    }
}));

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

const API_KEY = 'a-configured-key';

function echoBody(req: Request, res: Response) {
    res.json(req.body);
}

describe('buildControllerRouter request body trimming', () => {
    let server: Server;
    let baseURL: string;

    beforeAll(done => {
        const echoControllers = {
            users: { postLogin: echoBody },
            samples: { putValidated: echoBody },
            orders: { postResults: echoBody }
        } as unknown as Controllers;

        const app = express();
        app.use(express.json());
        app.use(buildControllerRouter(echoControllers, API_KEY, '/v2'));

        server = app.listen(0, '127.0.0.1', () => {
            baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
            done();
        });
    });

    afterAll(done => {
        server.close(done);
    });

    it('trims the email of a login but not the password', async () => {
        const { data } = await axios.post(`${baseURL}/v2/users/login`, {
            email: ' max@example.org\n',
            password: ' secret '
        });

        expect(data).toEqual({
            email: 'max@example.org',
            password: ' secret '
        });
    });

    it('trims the values of an order but not their oldValue', async () => {
        const { data } = await axios.put(`${baseURL}/v2/samples/validated`, {
            order: {
                sampleSet: {
                    meta: { sender: { street: ' Street 1 ' } },
                    samples: [
                        {
                            sampleData: {
                                sample_id: { value: ' 1 ', oldValue: ' 1 ' }
                            }
                        }
                    ]
                }
            }
        });

        expect(data.order.sampleSet.meta.sender.street).toBe('Street 1');
        expect(data.order.sampleSet.samples[0].sampleData.sample_id).toEqual({
            value: '1',
            oldValue: ' 1 '
        });
    });

    it('leaves the results import untouched', async () => {
        const body = [{ 'sample-1': { Biotyp: ' 4 \n' } }];

        const { data } = await axios.post(
            `${baseURL}/v2/orders/results`,
            body,
            { headers: { [API_KEY_HEADER]: API_KEY } }
        );

        expect(data).toEqual(body);
    });
});
