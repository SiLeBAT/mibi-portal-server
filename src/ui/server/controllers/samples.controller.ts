import { Request, Response } from 'express';
import moment from 'moment';
import { logger } from '../../../aspects';
import { SamplesController } from '../model/controller.model';
import {
    MalformedRequestError,
    TokenNotFoundError
} from '../model/domain.error';
import {
    PostSubmittedRequestDTO,
    PutValidatedRequestDTO,
    RedirectedPostSubmittedRequestDTO,
    RedirectedPutValidatedRequestDTO
} from '../model/request.model';
import { OrderDTO } from '../model/shared-dto.model';
import { AbstractController, ParseSingleResponse } from './abstract.controller';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    TokenPayload,
    TokenPort
} from '../../../app/authentication/model/token.model';
import { User, UserPort } from '../../../app/authentication/model/user.model';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { AppServerConfiguration } from '../ports';
import { DefaultServerErrorDTO } from '../model/response.model';

moment.locale('de');

enum RESOURCE_VIEW_TYPE {
    JSON,
    XLSX
}

type RESOURCE_VIEW_TYPE_STRING = 'xml' | 'json' | 'parsedsheet';

type ParseFileRequest = {
    type: RESOURCE_VIEW_TYPE_STRING;
    filename: string;
    data: string;
};
export class DefaultSamplesController
    extends AbstractController
    implements SamplesController
{
    private redirectionTarget: AxiosInstance;
    constructor(
        private tokenService: TokenPort,
        private userService: UserPort,
        configuration: AppServerConfiguration
    ) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }

    async putSamples(req: Request, res: Response) {
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
    async putValidated(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putValidated.name}, Request received`
        );
        try {
            const requestDTO: PutValidatedRequestDTO = req.body;
            let userEmail = req.currentActor?.email ?? null;
            if (!userEmail) {
                const token = getTokenFromHeader(req);
                if (token) {
                    const user: User = await this.getUserFromToken(token);
                    userEmail = user.email;
                }
            }

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                RedirectedPutValidatedRequestDTO
            >('functions/validateSampleData', {
                ...requestDTO,
                userEmail
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

    async postSubmitted(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postSubmitted.name}, Request received`
        );
        try {
            const requestDTO: PostSubmittedRequestDTO = req.body;
            let userEmail = req.currentActor?.email ?? null;
            if (!userEmail) {
                const token = getTokenFromHeader(req);
                if (!token) {
                    throw new TokenNotFoundError('Invalid user.');
                }
                const user: User = await this.getUserFromToken(token);
                userEmail = user.email;
            }

            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                RedirectedPostSubmittedRequestDTO
            >('functions/submitSampleData', {
                ...requestDTO,
                userEmail
            });

            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name}, Response sent`
            );
            logger.verbose('Response:', parseResponse.data.result);

            // The cloud function reports a rejected order by *returning* an
            // error DTO, which Parse hands back with a 200. Passing that on as
            // a 200 makes a refused submission look successful to an API user;
            // answer with 422 as the other sample endpoints do.
            const result = parseResponse.data
                .result as unknown as DefaultServerErrorDTO;
            if (this.isDefaultServerErrorDTO(result)) {
                this.axiosError(res, result);
            } else {
                this.ok(res, parseResponse.data.result);
            }
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
        const accept = req.headers['accept'];
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

            if (
                this.isDefaultServerErrorDTO(
                    parseResponse.data
                        .result as unknown as DefaultServerErrorDTO
                )
            ) {
                this.axiosError(
                    res,
                    parseResponse.data
                        .result as unknown as DefaultServerErrorDTO
                );
            } else {
                this.ok(res, parseResponse.data.result);
            }
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

    private putSamplesTransformInput(
        req: Request,
        _res: Response
    ): ParseFileRequest {
        const contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        let typeAsString: RESOURCE_VIEW_TYPE_STRING = 'json';
        let data = '';
        let filename = `${Date.now()}`;

        switch (type) {
            case RESOURCE_VIEW_TYPE.JSON: {
                if (req.body.parsedSampleSheet) {
                    // MPS-312: the client parsed the .xlsx into JSON in the browser
                    // and sent that JSON; only the NRL enrichment runs server-side.
                    typeAsString = 'parsedsheet';
                    filename = req.body.parsedSampleSheet.meta.fileName;
                    data = Buffer.from(
                        JSON.stringify(req.body.parsedSampleSheet)
                    ).toString('base64');
                } else {
                    // JSON order -> xlsx/pdf marshalling path.
                    typeAsString = 'json';
                    filename = req.body.order.sampleSet.meta.fileName;
                    data = Buffer.from(JSON.stringify(req.body)).toString(
                        'base64'
                    );
                }
                break;
            }
            case RESOURCE_VIEW_TYPE.XLSX:
            default: {
                // MPS-312: raw excel uploads are no longer accepted by the API.
                // Excel must be converted to JSON on the client before sending.
                throw new MalformedRequestError(
                    'Raw excel uploads are no longer supported; send parsed JSON instead.'
                );
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
        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        } else if (error instanceof TokenNotFoundError) {
            this.unauthorized(res, { message: 'Not authenticated' });
        } else {
            this.fail(res);
        }
    }
}
