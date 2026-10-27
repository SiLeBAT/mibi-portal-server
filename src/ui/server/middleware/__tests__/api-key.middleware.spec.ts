import { NextFunction, Request, Response } from 'express';
import { API_KEY_HEADER, requireApiKey } from '../api-key.middleware';

function mockResponse(): jest.Mocked<Response> {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

function mockRequest(headers: Record<string, unknown> = {}): Request {
    return {
        method: 'POST',
        path: '/v2/orders/results',
        headers
    } as unknown as Request;
}

const CONFIGURED_KEY = 'a-configured-key';

describe('requireApiKey middleware', () => {
    it('calls next when the presented key matches', () => {
        const req = mockRequest({ [API_KEY_HEADER]: CONFIGURED_KEY });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        requireApiKey(CONFIGURED_KEY)(req, res, next);

        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('fails closed with 401 when the server has no key configured', () => {
        const req = mockRequest({ [API_KEY_HEADER]: CONFIGURED_KEY });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        requireApiKey('')(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects a request without the header', () => {
        const req = mockRequest();
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        requireApiKey(CONFIGURED_KEY)(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects a wrong key of the same length', () => {
        const wrongKey = 'a-configured-kex';
        expect(wrongKey).toHaveLength(CONFIGURED_KEY.length);

        const req = mockRequest({ [API_KEY_HEADER]: wrongKey });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        requireApiKey(CONFIGURED_KEY)(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects a wrong key of a different length without throwing', () => {
        // timingSafeEqual throws on buffers of unequal length, so the length
        // guard in front of it has to catch this case.
        const req = mockRequest({ [API_KEY_HEADER]: 'short' });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        expect(() =>
            requireApiKey(CONFIGURED_KEY)(req, res, next)
        ).not.toThrow();
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects a repeated header, which express delivers as an array', () => {
        const req = mockRequest({
            [API_KEY_HEADER]: [CONFIGURED_KEY, CONFIGURED_KEY]
        });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        requireApiKey(CONFIGURED_KEY)(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('answers identically whether the key is missing or wrong', () => {
        const missingRes = mockResponse();
        const wrongRes = mockResponse();

        requireApiKey(CONFIGURED_KEY)(mockRequest(), missingRes, jest.fn());
        requireApiKey(CONFIGURED_KEY)(
            mockRequest({ [API_KEY_HEADER]: 'nope' }),
            wrongRes,
            jest.fn()
        );

        expect(missingRes.status).toHaveBeenCalledWith(401);
        expect(wrongRes.status).toHaveBeenCalledWith(401);
        expect(missingRes.json).toHaveBeenCalledWith(
            (wrongRes.json as jest.Mock).mock.calls[0][0]
        );
    });
});
