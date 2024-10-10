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
    PutSamplesJSONRequestDTO,
    PutValidatedRequestDTO,
    RedirectedPostSubmittedRequestDTO,
    RedirectedPutValidatedRequestDTO
} from '../model/request.model';
import {
    OrderDTO,
    SampleDataDTO,
    SampleDataEntryDTO,
    SampleDTO,
    SampleSetDTO,
    SampleSetMetaDTO
} from '../model/shared-dto.model';
import { AbstractController, ParseSingleResponse } from './abstract.controller';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { APPLICATION_TYPES } from '../../../app/application.types';
import {
    TokenPayload,
    TokenPort
} from '../../../app/authentication/model/token.model';
import { User, UserPort } from '../../../app/authentication/model/user.model';
import {
    AnnotatedSampleDataEntry,
    Sample,
    SampleData,
    SampleFactory,
    SamplePort,
    SampleSet,
    SampleSetMetaData,
    Urgency
} from '../../../app/ports';
import { NRLService } from '../../../app/sampleManagement/model/nrl.model';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import {
    InvalidExcelVersionErrorDTO,
    PutSamplesXLSXResponseDTO
} from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
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
        configuration: AppServerConfiguration,
        @inject(APPLICATION_TYPES.SampleService)
        private sampleService: SamplePort,
        @inject(APPLICATION_TYPES.NRLService) private nrlService: NRLService,
        @inject(APPLICATION_TYPES.SampleFactory) private factory: SampleFactory
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
            const sampleSet: SampleSet = await this.putSamplesTransformInputOld(
                req,
                res
            );

            if (!this.isValidExcelVersion(sampleSet)) {
                const errorDTO: InvalidExcelVersionErrorDTO = {
                    code: SERVER_ERROR_CODE.INVALID_VERSION,
                    message: 'Invalid excel version',
                    version: sampleSet.meta.version
                };
                res.status(422).json(errorDTO);
                return;
            }

            await this.putSamplesSendResponse(req, res, sampleSet);
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
        sampleSet: SampleSet
    ) {
        let accept = req.headers['accept'];

        const type = this.getResourceViewType(accept);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const result: PutSamplesXLSXResponseDTO =
                    await this.sampleService.convertToExcel(sampleSet);
                logger.info(
                    `${this.constructor.name}.${this.putSamples.name}, Response sent`
                );
                this.ok(res, result);
                break;
            case RESOURCE_VIEW_TYPE.JSON:
            default:
                try {
                    const parseRequest: ParseFileRequest =
                        await this.putSamplesTransformInput(req, res);

                    const parseResponse = await this.redirectionTarget.post<
                        ParseSingleResponse<OrderDTO>,
                        AxiosResponse<ParseSingleResponse<OrderDTO>>,
                        ParseFileRequest
                    >('functions/parseSampleData', parseRequest);
                    this.ok(res, parseResponse.data.result);
                } catch (error) {
                    logger.info(
                        `${this.constructor.name}.${this.putSamples.name} has thrown an error. ${error}`
                    );
                    this.handleError(res, error);
                }
        }
    }

    private isValidExcelVersion(sampleSet: SampleSet): boolean {
        const validVersion = 17;

        return parseInt(sampleSet.meta.version, 10) >= validVersion;
    }

    private async getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }

    private async putSamplesTransformInputOld(
        req: Request,
        res: Response
    ): Promise<SampleSet> {
        let contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        const token: string | null = getTokenFromHeader(req);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const file = this.parseInputDTO(() => {
                    return {
                        buffer: req.file!.buffer,
                        name: decodeURIComponent(req.file!.originalname)
                    };
                });
                return this.sampleService
                    .convertToJson(file.buffer, file.name, token)
                    .catch((error: Error) => {
                        throw error;
                    });
            case RESOURCE_VIEW_TYPE.JSON:
            default:
                const dto: PutSamplesJSONRequestDTO = req.body;
                return this.parseInputDTO(() => {
                    return this.fromDTOToSampleSet(dto.order.sampleSet);
                });
        }
    }

    private async putSamplesTransformInput(
        req: Request,
        res: Response
    ): Promise<ParseFileRequest> {
        let contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        let typeAsString: RESOURCE_VIEW_TYPE_STRING = 'xml';
        switch (type) {
            case RESOURCE_VIEW_TYPE.JSON:
                typeAsString = 'json';
                break;
            case RESOURCE_VIEW_TYPE.XLSX:
            default:
                typeAsString = 'xml';
        }

        return {
            type: typeAsString,
            filename: decodeURIComponent(req.file!.originalname),
            data: Buffer.from(req.file!.buffer).toString('base64')
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
        } else {
            this.fail(res);
        }
    }

    private fromDTOToSampleSet(dto: SampleSetDTO): SampleSet {
        const annotatedSampleSet: SampleSet = {
            meta: this.fromDTOToSampleSetMetaData(dto.meta),
            samples: dto.samples.map(container => {
                return this.fromDTOToSample(container);
            })
        };
        return annotatedSampleSet;
    }

    private fromDTOToSampleSetMetaData(
        dto: SampleSetMetaDTO
    ): SampleSetMetaData {
        return {
            sender: { ...dto.sender },
            fileName: dto.fileName ? dto.fileName : '',
            customerRefNumber: dto.customerRefNumber
                ? dto.customerRefNumber
                : '',
            signatureDate: dto.signatureDate ? dto.signatureDate : '',
            version: dto.version ? dto.version : ''
        };
    }

    private fromUrgencyStringToEnum(urgency: string): Urgency {
        switch (urgency.trim().toLowerCase()) {
            case 'eilt':
                return Urgency.URGENT;
            case 'normal':
            default:
                return Urgency.NORMAL;
        }
    }

    private fromDTOToSample({ sampleData, sampleMeta }: SampleDTO): Sample {
        const annotatedSample = this.fromDTOToAnnotatedSampleData(sampleData);
        const sample = this.factory.createSample({ ...annotatedSample });
        sample.setAnalysis(this.nrlService, sampleMeta.analysis);
        sample.setUrgency(this.fromUrgencyStringToEnum(sampleMeta.urgency));
        return sample;
    }

    private fromDTOToAnnotatedSampleData(dto: SampleDataDTO): SampleData {
        const annotatedSampleData: Record<string, AnnotatedSampleDataEntry> =
            {};
        for (const prop in dto) {
            annotatedSampleData[prop] = this.fromDTOToAnnotatedSampleDataEntry(
                dto[prop]
            );
        }
        return annotatedSampleData as SampleData;
    }

    private fromDTOToAnnotatedSampleDataEntry(
        dto: SampleDataEntryDTO
    ): AnnotatedSampleDataEntry {
        const annotatedSampleDataEntry: AnnotatedSampleDataEntry = {
            value: dto.value,
            errors: dto.errors ? dto.errors : [],
            correctionOffer: dto.correctionOffer ? dto.correctionOffer : []
        };

        if (dto.oldValue !== undefined) {
            annotatedSampleDataEntry.oldValue = dto.oldValue;
        }

        return annotatedSampleDataEntry;
    }
}
