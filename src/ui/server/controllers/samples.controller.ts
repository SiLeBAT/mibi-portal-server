import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpPost,
    httpPut,
    request,
    response
} from 'inversify-express-utils';
import moment from 'moment';
import { logger } from '../../../aspects';
import { SamplesController } from '../model/controller.model';
import {
    MalformedRequestError,
    TokenNotFoundError
} from '../model/domain.error';
import { API_ROUTE, SERVER_ERROR_CODE } from '../model/enums';
import {
    PostSubmittedRequestDTO,
    PutValidatedRequestDTO,
    RedirectedPostSubmittedRequestDTO,
    RedirectedPutValidatedRequestDTO
} from '../model/request.model';
import { OrderDTO } from '../model/shared-dto.model';
import { AbstractController, ParseSingleResponse } from './abstract.controller';

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { APPLICATION_TYPES } from '../../../app/application.types';
import {
    TokenPayload,
    TokenPort
} from '../../../app/authentication/model/token.model';
import { User, UserPort } from '../../../app/authentication/model/user.model';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import {
    DefaultServerErrorDTO,
    InvalidExcelVersionErrorDTO
} from '../model/response.model';
moment.locale('de');

enum RESOURCE_VIEW_TYPE {
    JSON,
    XLSX
}

type RESOURCE_VIEW_TYPE_STRING = 'xml' | 'json';

enum SAMPLES_ROUTE {
    ROOT = '/samples',
    VALIDATED = '/validated',
    SUBMITTED = '/submitted'
}

type ParseFileRequest = {
    type: RESOURCE_VIEW_TYPE_STRING;
    filename: string;
    data: string;
};
@controller(API_ROUTE.V2 + SAMPLES_ROUTE.ROOT)
export class DefaultSamplesController
    extends AbstractController
    implements SamplesController
{
    private redirectionTarget: AxiosInstance;
    constructor(
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort,
        @inject(APPLICATION_TYPES.UserService) private userService: UserPort,
        @inject(SERVER_TYPES.AppServerConfiguration)
        configuration: AppServerConfiguration
    ) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }

    @httpPut('/', SERVER_TYPES.MulterMW)
    async putSamples(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putSamples.name}, Request received`
        );
        try {
            const parseRequest: ParseFileRequest =
                await this.putSamplesTransformInput(req, res);

            await this.putSamplesSendResponse(req, res, parseRequest);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putSamples.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPut(SAMPLES_ROUTE.VALIDATED)
    async putValidated(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putValidated.name}, Request received`
        );
        try {
            const requestDTO: PutValidatedRequestDTO = req.body;
            const token = getTokenFromHeader(req);
            let userId = null;
            if (token) {
                const user: User = await this.getUserFromToken(token);
                userId = user.email;
            }

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                RedirectedPutValidatedRequestDTO
            >('functions/validateSampleData', {
                ...requestDTO,
                userEmail: userId
            });
            logger.info(
                `${this.constructor.name}.${this.putValidated.name}, Response sent`
            );
            logger.verbose('Response:', parseResponse.data.result);
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putValidated.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPost(SAMPLES_ROUTE.SUBMITTED)
    async postSubmitted(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postSubmitted.name}, Request received`
        );
        try {
            const requestDTO: PostSubmittedRequestDTO = req.body;
            const token = getTokenFromHeader(req);
            if (!token) {
                throw new TokenNotFoundError('Invalid user.');
            }
            const user: User = await this.getUserFromToken(token);

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                RedirectedPostSubmittedRequestDTO
            >('functions/submitSampleData', {
                ...requestDTO,
                userEmail: user.email
            });

            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name}, Response sent`
            );
            logger.verbose('Response:', parseResponse.data.result);
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private async putSamplesSendResponse(
        req: Request,
        res: Response,
        parseRequest: ParseFileRequest
    ) {
        let accept = req.headers['accept'];
        try {
            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                ParseFileRequest
            >('functions/parseSampleData', parseRequest, {
                headers: {
                    Accept: accept
                }
            });
            this.ok(res, parseResponse.data.result);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putSamples.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private async getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }

    // N.B. This functionality will probably move to the FE
    private async putSamplesTransformInput(
        req: Request,
        res: Response
    ): Promise<ParseFileRequest> {
        let contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        let typeAsString: RESOURCE_VIEW_TYPE_STRING = 'xml';
        let data = '';
        let filename = `${Date.now()}`;

        switch (type) {
            case RESOURCE_VIEW_TYPE.JSON: {
                typeAsString = 'json';
                filename = req.body.order.sampleSet.meta.fileName;
                data = Buffer.from(JSON.stringify(req.body)).toString('base64');
                break;
            }
            case RESOURCE_VIEW_TYPE.XLSX:
            default: {
                typeAsString = 'xml';
                filename = decodeURIComponent(req.file!.originalname);
                data = Buffer.from(req.file!.buffer).toString('base64');
            }
        }
        return {
            type: typeAsString,
            filename,
            data
        };
    }

    private getResourceViewType(
        typeString: string = 'application/json'
    ): RESOURCE_VIEW_TYPE {
        let returnType = RESOURCE_VIEW_TYPE.JSON;

        if (typeString.includes('multipart/form-data')) {
            returnType = RESOURCE_VIEW_TYPE.XLSX;
        }
        if (
            typeString.includes(
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        ) {
            returnType = RESOURCE_VIEW_TYPE.XLSX;
        }
        return returnType;
    }

    private handleError(res: Response, error: Error) {
        if (axios.isAxiosError(error)) {
            if (this.isEmailFailureError(error)) {
                const errorDTO: DefaultServerErrorDTO = {
                    code: SERVER_ERROR_CODE.INVALID_EMAIL,
                    message:
                        (error.response?.data as { error: string }).error ||
                        error.message
                };
                this.axiosError(res, errorDTO);
            }

            if (this.isExcelVersionError(error)) {
                const message = error.response?.data.error as string;
                const version = message.includes(':')
                    ? error.response?.data.error.split(':')[1]
                    : '';

                const errorDTO: InvalidExcelVersionErrorDTO = {
                    code: SERVER_ERROR_CODE.INVALID_VERSION,
                    message: message,
                    version: version
                };
                this.axiosError(res, errorDTO);
            }
        }

        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        }

        this.fail(res);
    }

    private isEmailFailureError(error: AxiosError): boolean {
        const errorString = 'email validation failed';
        const errorObj = error.response?.data as { error: string };

        if (errorObj && errorObj.error.toLowerCase().includes(errorString)) {
            return true;
        }

        return false;
    }

    private isExcelVersionError(error: AxiosError): boolean {
        const errorString = 'invalid excel version';
        const errorObj = error.response?.data as { error: string };

        if (errorObj && errorObj.error.toLowerCase().includes(errorString)) {
            return true;
        }

        return false;
    }
}
