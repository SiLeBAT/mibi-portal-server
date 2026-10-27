import { decode, JwtPayload, verify } from 'jsonwebtoken';
import {
    bearer,
    expiredTestToken,
    signTestToken,
    tamperedTestToken,
    TEST_JWT_SECRET,
    unsignedTestToken
} from '../../../../__mocks__/jwt';
import {
    TestContainer,
    createTestContainer
} from '../../../../__mocks__/test-container';
import { TokensController } from '../../model/controller.model';
import { SERVER_ERROR_CODE } from '../../model/enums';
import { SERVER_TYPES } from '../../server.types';

var mockReq = require('mock-express-request');
var mockRes = require('mock-express-response');

const SERVER_CONFIG = {
    port: 1,
    apiRoot: '',
    publicAPIDoc: {},
    jwtSecret: TEST_JWT_SECRET,
    logLevel: 'info',
    supportContact: 'test',
    parseAPI: '',
    appId: ''
};

const APP_CONFIG = {
    appName: 'test',
    jobRecipient: 'test',
    login: { threshold: 0, secondsDelay: 0 },
    clientUrl: 'test',
    supportContact: 'test',
    jwtSecret: TEST_JWT_SECRET
};

describe('DefaultTokensController', () => {
    let container: TestContainer | null;
    let controller: TokensController;

    beforeEach(() => {
        container = createTestContainer({
            serverConfig: SERVER_CONFIG as any,
            appConfig: APP_CONFIG
        });
        controller = container.get<TokensController>(
            SERVER_TYPES.TokensController
        );
    });

    afterEach(() => {
        container = null;
    });

    async function postTokens(authorization?: string) {
        const req = new mockReq({
            headers: authorization ? { authorization } : {}
        });
        const res = new mockRes();
        await controller.postTokens(req, res);
        return res;
    }

    // ── POST /v2/tokens ──────────────────────────────────────────────────────

    describe('POST /v2/tokens', () => {
        describe('rejects with 401', () => {
            it.each([
                ['no Authorization header', undefined],
                ['a non-Bearer scheme', `Basic ${signTestToken()}`],
                ['a Bearer scheme without a token', 'Bearer'],
                ['a token that is not a JWT', bearer('not-a-jwt')],
                [
                    'a token signed with another secret',
                    bearer(signTestToken('user-1', {}, 'other-secret'))
                ],
                ['an expired token', bearer(expiredTestToken())],
                ['an unsigned (alg=none) token', bearer(unsignedTestToken())],
                ['a token with a tampered payload', bearer(tamperedTestToken())]
            ])('for %s', async (_case, authorization) => {
                const res = await postTokens(authorization);

                expect(res.statusCode).toBe(401);
                expect(res._getJSON().code).toBe(
                    SERVER_ERROR_CODE.AUTHORIZATION_ERROR
                );
                expect(res._getJSON().token).toBeUndefined();
            });
        });

        it('returns a refreshed token for a valid token', async () => {
            const res = await postTokens(bearer(signTestToken('user-1')));

            expect(res.statusCode).toBe(200);
            const body = res._getJSON();
            expect(body.refresh).toBe(true);
            const payload = verify(body.token, TEST_JWT_SECRET) as JwtPayload;
            expect(payload.sub).toBe('user-1');
        });

        it('extends the expiry of a token that is about to expire', async () => {
            const oldToken = signTestToken('user-1', { expiresIn: 5 });

            const res = await postTokens(bearer(oldToken));

            const oldExp = (decode(oldToken) as JwtPayload).exp!;
            const newExp = (decode(res._getJSON().token) as JwtPayload).exp!;
            expect(newExp).toBeGreaterThan(oldExp);
        });

        it('keeps the subject of the old token', async () => {
            const res = await postTokens(bearer(signTestToken('user-42')));

            const payload = decode(res._getJSON().token) as JwtPayload;
            expect(payload.sub).toBe('user-42');
        });
    });
});
