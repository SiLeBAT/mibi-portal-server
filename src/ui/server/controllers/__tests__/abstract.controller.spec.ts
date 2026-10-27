import { Response } from 'express';
import { logger } from '../../../../aspects';
import { SERVER_ERROR_CODE } from '../../model/enums';
import { AbstractController } from '../abstract.controller';

var mockRes = require('mock-express-response');

jest.mock('../../../../aspects', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        verbose: jest.fn()
    }
}));

class TestController extends AbstractController {
    run(res: Response, operation: () => void | Promise<void>) {
        return this.handleRequest(res, 'run', operation);
    }

    respondOk(res: Response) {
        this.ok(res, { done: true });
    }
}

class OverridingController extends TestController {
    handled: unknown[] = [];

    protected handleError(res: Response, error: unknown) {
        this.handled.push(error);
        this.forbidden(res);
    }
}

describe('AbstractController.handleRequest', () => {
    let controller: TestController;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new TestController();
    });

    it('runs the operation and lets it send the response', async () => {
        const res = new mockRes();

        await controller.run(res, () => controller.respondOk(res));

        expect(res.statusCode).toBe(200);
        expect(res._getJSON()).toEqual({ done: true });
    });

    it('awaits an asynchronous operation before resolving', async () => {
        const res = new mockRes();

        await controller.run(res, async () => {
            await Promise.resolve();
            controller.respondOk(res);
        });

        expect(res.statusCode).toBe(200);
    });

    it('responds synchronously for a synchronous operation', () => {
        const res = new mockRes();

        // not awaited on purpose: callers like the routes for /info rely on it
        void controller.run(res, () => controller.respondOk(res));

        expect(res.statusCode).toBe(200);
    });

    it('logs request received and response sent with the controller and operation name', async () => {
        const res = new mockRes();

        await controller.run(res, () => controller.respondOk(res));

        expect(logger.info).toHaveBeenCalledWith(
            'TestController.run, Request received'
        );
        expect(logger.info).toHaveBeenCalledWith(
            'TestController.run, Response sent'
        );
    });

    describe('when the operation throws', () => {
        it('answers 500 with the unknown error code by default', async () => {
            const res = new mockRes();

            await controller.run(res, () => {
                throw new Error('boom');
            });

            expect(res.statusCode).toBe(500);
            expect(res._getJSON()).toEqual({
                code: SERVER_ERROR_CODE.UNKNOWN_ERROR,
                message: 'An unknown error occured'
            });
        });

        it('answers 500 when an asynchronous operation rejects', async () => {
            const res = new mockRes();

            await controller.run(res, async () => {
                await Promise.resolve();
                throw new Error('boom');
            });

            expect(res.statusCode).toBe(500);
        });

        it('answers synchronously when a synchronous operation throws', () => {
            const res = new mockRes();

            void controller.run(res, () => {
                throw new Error('boom');
            });

            expect(res.statusCode).toBe(500);
        });

        it('does not reject, so the route handler never sees the error', async () => {
            const res = new mockRes();

            await expect(
                controller.run(res, () => {
                    throw new Error('boom');
                })
            ).resolves.toBeUndefined();
        });

        it('logs the error and does not log response sent', async () => {
            const res = new mockRes();

            await controller.run(res, () => {
                throw new Error('boom');
            });

            expect(logger.info).toHaveBeenCalledWith(
                'TestController.run has thrown an error. Error: boom'
            );
            expect(logger.info).not.toHaveBeenCalledWith(
                'TestController.run, Response sent'
            );
        });

        it('passes the error to an overridden handleError', async () => {
            const overriding = new OverridingController();
            const res = new mockRes();
            const error = new Error('boom');

            await overriding.run(res, () => {
                throw error;
            });

            expect(overriding.handled).toEqual([error]);
            expect(res.statusCode).toBe(403);
        });
    });
});
