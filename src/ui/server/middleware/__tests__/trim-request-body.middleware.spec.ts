import { NextFunction, Request, Response } from 'express';
import { trimRequestBody } from '../trim-request-body.middleware';

function mockResponse(): jest.Mocked<Response> {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

function mockRequest(body: unknown): Request {
    return {
        method: 'POST',
        path: '/v2/users/login',
        body
    } as unknown as Request;
}

describe('trimRequestBody middleware', () => {
    it('trims the body and calls next', () => {
        const req = mockRequest({ email: ' max@example.org\n' });
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        trimRequestBody(req, res, next);

        expect(req.body).toEqual({ email: 'max@example.org' });
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('calls next for a request without a body', () => {
        const req = mockRequest(undefined);
        const next: NextFunction = jest.fn();

        trimRequestBody(req, mockResponse(), next);

        expect(req.body).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
    });

    it('answers 400 when the body is nested too deeply to walk', () => {
        const depth = 1000000;
        const req = mockRequest(
            JSON.parse('['.repeat(depth) + ']'.repeat(depth))
        );
        const res = mockResponse();
        const next: NextFunction = jest.fn();

        trimRequestBody(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
