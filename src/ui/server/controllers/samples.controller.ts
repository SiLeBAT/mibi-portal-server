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
import {
    AnnotatedSampleDataEntry,
    ApplicantMetaData,
    FormAutoCorrectionPort,
    FormValidatorPort,
    ReceiveAs,
    Sample,
    SampleData,
    SampleFactory,
    SampleMetaData,
    SamplePort,
    SampleSet,
    SampleSetMetaData,
    TokenPayload,
    TokenPort,
    Urgency,
    User,
    UserPort,
    ValidationOptions
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { SamplesController } from '../model/controller.model';
import {
    MalformedRequestError,
    TokenNotFoundError
} from '../model/domain.error';
import { API_ROUTE, SERVER_ERROR_CODE } from '../model/enums';
import {
    PostSubmittedRequestDTO,
    PutValidatedRequestDTO
} from '../model/request.model';
import {
    AutoCorrectedInputErrorDTO,
    InvalidInputErrorDTO,
    PostSubmittedResponseDTO
} from '../model/response.model';
import {
    OrderDTO,
    SampleDTO,
    SampleDataDTO,
    SampleDataEntryDTO,
    SampleSetDTO,
    SampleSetMetaDTO
} from '../model/shared-dto.model';
import { AnalysisDTO, SampleMetaDTO } from './../model/shared-dto.model';
import { AbstractController, ParseSingleResponse } from './abstract.controller';

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { NRLService } from '../../../app/sampleManagement/model/nrl.model';
import { Analysis } from '../../../app/sampleManagement/model/sample.model';
import { AppServerConfiguration } from '../ports';
import { SERVER_TYPES } from '../server.types';
import { APPLICATION_TYPES } from './../../../app/application.types';
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
        @inject(APPLICATION_TYPES.FormValidatorService)
        private formValidationService: FormValidatorPort,
        @inject(APPLICATION_TYPES.FormAutoCorrectionService)
        private formAutoCorrectionService: FormAutoCorrectionPort,
        @inject(APPLICATION_TYPES.SampleService)
        private sampleService: SamplePort,
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort,
        @inject(APPLICATION_TYPES.UserService) private userService: UserPort,
        // dirty fix: Use of NRLService instead of NRLPort
        @inject(APPLICATION_TYPES.NRLService) private nrlService: NRLService,
        @inject(APPLICATION_TYPES.SampleFactory) private factory: SampleFactory,
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

    @httpPut(SAMPLES_ROUTE.VALIDATED)
    async putValidated(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putValidated.name}, Request received`
        );
        try {
            const requestDTO: PutValidatedRequestDTO = req.body;
            const parseResponse = await this.redirectionTarget.post<
                ParseSingleResponse<OrderDTO>,
                AxiosResponse<ParseSingleResponse<OrderDTO>>,
                PutValidatedRequestDTO
            >('functions/validateSampleData', requestDTO);
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
            const annotatedSampleSet: SampleSet = this.parseInputDTO(() => {
                return this.fromDTOToSampleSet(requestDTO.order.sampleSet);
            });
            const validationOptions: ValidationOptions =
                await this.getValidationOptions(req);
            const validatedSamples: Sample[] = await this.validateSamples(
                annotatedSampleSet.samples,
                validationOptions
            );

            const validatedSampleSet: SampleSet = {
                samples: validatedSamples,
                meta: annotatedSampleSet.meta
            };

            const orderDTO: OrderDTO =
                this.fromSampleSetToOrderDTO(validatedSampleSet);

            if (this.hasSampleError(validatedSamples)) {
                const errorDTO: InvalidInputErrorDTO = {
                    code: SERVER_ERROR_CODE.INVALID_INPUT,
                    message: 'Contains errors',
                    order: orderDTO
                };
                res.status(422).json(errorDTO);
                return;
            }
            if (this.hasSampleAutoCorrection(validatedSamples)) {
                const errorDTO: AutoCorrectedInputErrorDTO = {
                    code: SERVER_ERROR_CODE.AUTOCORRECTED_INPUT,
                    message: 'Has been auto-corrected',
                    order: orderDTO
                };
                res.status(422).json(errorDTO);
                return;
            }

            const responseDTO: PostSubmittedResponseDTO = {
                order: orderDTO
            };

            const token = getTokenFromHeader(req);
            if (!token) {
                throw new TokenNotFoundError('Invalid user.');
            }
            const user: User = await this.getUserFromToken(token);
            const applicantMetaData: ApplicantMetaData = this.parseInputDTO(
                () => {
                    return this.fromPostSubmittedRequestDTOToApplicantMetaData(
                        requestDTO,
                        user
                    );
                }
            );

            await this.sampleService.sendSamples(
                validatedSampleSet,
                applicantMetaData
            );

            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name}, Response sent`
            );
            logger.verbose('Response:', responseDTO);
            this.ok(res, responseDTO);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postSubmitted.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
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

    private async validateSamples(
        samples: Sample[],
        options: ValidationOptions
    ): Promise<Sample[]> {
        // 1) Auto-correction needs to happen before validation.
        // 2) Assign NRL
        // 3) Validate Samples
        const autocorrectedSamples =
            await this.formAutoCorrectionService.applyAutoCorrection(samples);

        const assignedSamples =
            this.nrlService.assignNRLsToSamples(autocorrectedSamples);

        const validationResult =
            await this.formValidationService.validateSamples(
                assignedSamples,
                options
            );

        return validationResult;
    }

    private async getValidationOptions(
        req: Request
    ): Promise<ValidationOptions> {
        const validationOptions: ValidationOptions = {};

        const token = getTokenFromHeader(req);
        let stateShort = '';
        if (token) {
            const user: User = await this.getUserFromToken(token);
            try {
                const instute = user.institution;
                stateShort = instute.stateShort;
            } catch (error) {
                logger.info(
                    `${this.constructor.name}.${this.getValidationOptions.name}, no state found for user. Using default state. error=${error}`
                );
            }
        }

        validationOptions.state = stateShort;
        return validationOptions;
    }

    private async getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
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

    private fromSampleSetMetaDataToDTO(
        data: SampleSetMetaData
    ): SampleSetMetaDTO {
        return {
            sender: { ...data.sender },
            fileName: data.fileName,
            customerRefNumber:
                data.customerRefNumber === ''
                    ? undefined
                    : data.customerRefNumber, // non-breaking API change
            signatureDate:
                data.signatureDate === '' ? undefined : data.signatureDate, // non-breaking API change
            version: data.version
        };
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

    private fromSampleSetToOrderDTO(sampleSet: SampleSet): OrderDTO {
        return {
            sampleSet: {
                samples: this.fromSampleCollectionToSampleDTO(
                    sampleSet.samples
                ),
                meta: this.fromSampleSetMetaDataToDTO(sampleSet.meta)
            }
        };
    }

    private fromSampleCollectionToSampleDTO(
        sampleCollection: Sample[]
    ): SampleDTO[] {
        return sampleCollection.map((sample: Sample) => ({
            sampleData: sample.getAnnotatedData(),
            sampleMeta: this.fromSampleMetaToDTO(sample.meta)
        }));
    }

    private fromSampleMetaToDTO(meta: SampleMetaData): SampleMetaDTO {
        return {
            nrl: meta.nrl.toString(),
            analysis: this.fromAnalysisToDTO(meta.analysis),
            urgency: meta.urgency.toString()
        };
    }

    private fromAnalysisToDTO(analysis: Partial<Analysis>): AnalysisDTO {
        return {
            species: analysis.species || false,
            serological: analysis.serological || false,
            resistance: analysis.resistance || false,
            vaccination: analysis.vaccination || false,
            molecularTyping: analysis.molecularTyping || false,
            toxin: analysis.toxin || false,
            esblAmpCCarbapenemasen: analysis.esblAmpCCarbapenemasen || false,
            sample: analysis.sample || false,
            other: analysis.other || '',
            compareHuman: analysis.compareHuman || {
                value: '',
                active: false
            }
        };
    }
    private fromPostSubmittedRequestDTOToApplicantMetaData(
        requestDTO: PostSubmittedRequestDTO,
        user: User
    ): ApplicantMetaData {
        let receiveAs: ReceiveAs;
        switch (requestDTO.receiveAs) {
            case ReceiveAs.PDF.toString():
                receiveAs = ReceiveAs.PDF;
                break;
            case ReceiveAs.EXCEL.toString():
            default:
                receiveAs = ReceiveAs.EXCEL;
                break;
        }

        return {
            user,
            comment: requestDTO.comment || '',
            receiveAs: receiveAs
        };
    }

    private hasSampleError(annotatedSamples: Sample[]): boolean {
        return this.hasSampleFault(annotatedSamples, 2);
    }
    private hasSampleAutoCorrection(annotatedSamples: Sample[]): boolean {
        return this.hasSampleFault(annotatedSamples, 4);
    }
    private hasSampleFault(
        annotatedSamples: Sample[],
        errorLevel: number
    ): boolean {
        return !!annotatedSamples.reduce((acc: number, entry: Sample) => {
            let count = entry.getErrorCount(errorLevel);
            return (acc += count);
        }, 0);
    }
}
