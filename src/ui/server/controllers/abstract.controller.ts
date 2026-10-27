import { Response } from 'express';
import { logger } from '../../../aspects';
import { Controller } from '../model/controller.model';
import { MalformedRequestError } from '../model/domain.error';
import { SERVER_ERROR_CODE } from '../model/enums';
import { DefaultServerErrorDTO } from '../model/response.model';

export interface ParseCollectionResponse<T> {
    results: T[];
}

export interface ParseSingleResponse<T> {
    result: T;
}
export interface ParseEntityDTO {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}

export abstract class AbstractController implements Controller {
    /**
     * Runs the logic of an endpoint with the logging and error handling every
     * endpoint shares. Errors thrown by the operation are passed to
     * handleError, which concrete controllers can override.
     *
     * The operation runs synchronously up to its first await, so a synchronous
     * operation responds before the returned promise settles.
     */
    protected async handleRequest(
        res: Response,
        operationName: string,
        operation: () => void | Promise<void>
    ): Promise<void> {
        const context = `${this.constructor.name}.${operationName}`;
        logger.info(`${context}, Request received`);
        try {
            await operation();
            logger.info(`${context}, Response sent`);
        } catch (error) {
            logger.info(`${context} has thrown an error. ${error}`);
            this.handleError(res, error);
        }
    }

    protected handleError(res: Response, _error: unknown): void {
        this.fail(res);
    }

    protected jsonResponse<T>(
        response: Response,
        code: number,
        dto: T
    ): Response {
        return response.status(code).json(dto);
    }

    protected ok<T>(response: Response, dto?: T): Response {
        if (dto) {
            return this.jsonResponse<T>(response, 200, dto);
        } else {
            return response.sendStatus(200);
        }
    }

    protected unauthorized<T>(response: Response, dto: T): Response {
        return this.jsonResponse<T>(response, 401, dto);
    }

    protected forbidden(response: Response): Response {
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
            message: 'Forbidden'
        };
        return this.jsonResponse(response, 403, dto);
    }

    protected clientError(response: Response): Response {
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.INPUT_ERROR,
            message: 'Malformed request'
        };
        return this.jsonResponse(response, 400, dto);
    }

    protected axiosError<T extends DefaultServerErrorDTO>(
        response: Response,
        dto: T
    ): Response {
        return this.jsonResponse(response, 422, dto);
    }

    protected fail(
        response: Response,
        message: string = 'An unknown error occured'
    ): Response {
        const dto: DefaultServerErrorDTO = {
            code: SERVER_ERROR_CODE.UNKNOWN_ERROR,
            message
        };
        return this.jsonResponse(response, 500, dto);
    }

    protected parseInputDTO<T>(parseOp: () => T): T {
        try {
            return parseOp();
        } catch (error) {
            throw new MalformedRequestError(
                `Error parsing input. error=${error}`
            );
        }
    }

    protected isDefaultServerErrorDTO<T extends DefaultServerErrorDTO>(
        obj: T
    ): obj is T {
        return obj != null && 'code' in obj && 'message' in obj;
    }
}
