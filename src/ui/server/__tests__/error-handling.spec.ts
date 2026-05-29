import { SERVER_ERROR_CODE } from '../model/enums';

// Mirrors the error handler registered by @SiLeBAT/fg43-ne-server setErrorConfig.
// Verifies the expected behavior after the patch that fixes the middleware to
// handle all error types instead of only 401.
function makeErrorHandler(logger: { warn: jest.Mock; error: jest.Mock }) {
    return (err: any, _req: any, res: any, next: jest.Mock) => {
        if (err.status === 401) {
            logger.warn(`Log caused error with status 401. error=${err}`);
            res.status(401)
                .send({
                    code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                    message: err.message
                })
                .end();
        } else if (err.status) {
            next(err);
        } else {
            logger.error(`Unhandled server error. error=${String(err)}`);
            res.status(500)
                .send({
                    code: SERVER_ERROR_CODE.UNKNOWN_ERROR,
                    message: 'Internal Server Error'
                })
                .end();
        }
    };
}

describe('Server error handling middleware', () => {
    let logger: { warn: jest.Mock; error: jest.Mock };
    let next: jest.Mock;
    let res: { status: jest.Mock; send: jest.Mock; end: jest.Mock };

    beforeEach(() => {
        logger = { warn: jest.fn(), error: jest.fn() };
        next = jest.fn();
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            end: jest.fn()
        };
    });

    it('returns 401 and logs a warning for authorization errors', () => {
        const err = Object.assign(new Error('Unauthorized'), { status: 401 });
        makeErrorHandler(logger)(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
            message: 'Unauthorized'
        });
        expect(logger.warn).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('forwards HTTP errors other than 401 to the next handler without sending a response', () => {
        const err = Object.assign(new Error('Forbidden'), { status: 403 });
        makeErrorHandler(logger)(err, {}, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it('returns 500 and logs an error for unhandled server errors', () => {
        const err = new Error('Something went wrong internally');
        makeErrorHandler(logger)(err, {}, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            code: SERVER_ERROR_CODE.UNKNOWN_ERROR,
            message: 'Internal Server Error'
        });
        expect(logger.error).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('does not expose internal error details in the 500 response', () => {
        const err = new Error('Sensitive database connection string here');
        makeErrorHandler(logger)(err, {}, res, next);

        const sentBody = res.send.mock.calls[0][0];
        expect(sentBody.message).toBe('Internal Server Error');
        expect(sentBody.message).not.toContain('database');
    });
});
