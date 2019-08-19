import { SampleMetaDTO } from './../model/shared-dto.model';
import { SampleMetaData } from './../../../app/sampleManagement/model/sample.model';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import {
    FormValidatorPort,
    FormAutoCorrectionPort,
    Sample,
    createSample,
    ValidationOptions,
    SamplePort,
    SenderInfo,
    ExcelFileInfo,
    Attachment,
    AnnotatedSampleDataEntry,
    SampleData,
    SampleSet,
    SampleSetMetaData,
    TokenPayload,
    TokenPort,
    UserPort,
    NRLPort,
    Urgency,
    User,
    DefaultNRLService
} from '../../../app/ports';
import { SamplesController } from '../model/controller.model';
import {
    PostSubmittedRequestDTO,
    PutValidatedRequestDTO,
    PutSamplesJSONRequestDTO
} from '../model/request.model';
import { SERVER_ERROR_CODE, ROUTE } from '../model/enums';
import {
    MalformedRequestError,
    TokenNotFoundError
} from '../model/domain.error';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import { AbstractController } from './abstract.controller';
import {
    SampleDataDTO,
    SampleSetDTO,
    SampleDataEntryDTO,
    OrderDTO,
    SampleSetMetaDTO,
    SampleDTO
} from '../model/shared-dto.model';
import {
    InvalidInputErrorDTO,
    AutoCorrectedInputErrorDTO,
    PutValidatedResponseDTO,
    PostSubmittedResponseDTO,
    PutSamplesJSONResponseDTO,
    PutSamplesXLSXResponseDTO
} from '../model/response.model';
import {
    controller,
    httpPut,
    httpPost,
    request,
    response
} from 'inversify-express-utils';
import { inject } from 'inversify';

import { APPLICATION_TYPES } from './../../../app/application.types';
import SERVER_TYPES from '../server.types';
moment.locale('de');

enum RESOURCE_VIEW_TYPE {
    JSON,
    XLSX
}

enum SAMPLES_ROUTE {
    ROOT = '/samples',
    VALIDATED = '/validated',
    SUBMITTED = '/submitted'
}
@controller(ROUTE.VERSION + SAMPLES_ROUTE.ROOT)
export class DefaultSamplesController extends AbstractController
    implements SamplesController {
    constructor(
        @inject(APPLICATION_TYPES.FormValidatorService)
        private formValidationService: FormValidatorPort,
        @inject(APPLICATION_TYPES.FormAutoCorrectionService)
        private formAutoCorrectionService: FormAutoCorrectionPort,
        @inject(APPLICATION_TYPES.SampleService)
        private sampleService: SamplePort,
        @inject(APPLICATION_TYPES.TokenService) private tokenService: TokenPort,
        @inject(APPLICATION_TYPES.UserService) private userService: UserPort,
        @inject(APPLICATION_TYPES.NRLService) private nrlService: NRLPort
    ) {
        super();
    }

    @httpPut('/', SERVER_TYPES.MulterMW)
    async putSamples(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.putSamples.name}, Request received`
        );
        try {
            const sampleSet: SampleSet = await this.transformInput(req, res);

            await this.sendResponse(req, res, sampleSet);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${
                    this.putSamples.name
                } has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPut(SAMPLES_ROUTE.VALIDATED)
    async putValidated(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${
                this.putValidated.name
            }, Request received`
        );
        try {
            const requestDTO: PutValidatedRequestDTO = req.body;
            const sampleSet: SampleSet = this.tryParseInputDTO(() => {
                return this.fromDTOToUnannotatedSampleSet(
                    requestDTO.order.sampleSet
                );
            });
            const validationOptions = await this.getValidationOptions(
                sampleSet.meta,
                req
            );
            const validationResult: Sample[] = await this.validateSamples(
                sampleSet.samples,
                validationOptions
            );
            const validatedOrderDTO: OrderDTO = this.fromSampleCollectionToOrderDTO(
                validationResult,
                sampleSet.meta
            );
            const responseDTO: PutValidatedResponseDTO = {
                order: validatedOrderDTO
            };
            logger.info(
                `${this.constructor.name}.${
                    this.putValidated.name
                }, Response sent`
            );
            logger.verbose('Response:', responseDTO);
            this.ok(res, responseDTO);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${
                    this.putValidated.name
                } has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    @httpPost(SAMPLES_ROUTE.SUBMITTED)
    async postSubmitted(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${
                this.postSubmitted.name
            }, Request received`
        );
        try {
            const requestDTO: PostSubmittedRequestDTO = req.body;
            const annotatedSampleSet: SampleSet = this.tryParseInputDTO(() => {
                return this.fromDTOToSampleSet(requestDTO.order.sampleSet);
            });
            const validationOptions: ValidationOptions = await this.getValidationOptions(
                annotatedSampleSet.meta,
                req
            );
            const validatedSamples: Sample[] = await this.validateSamples(
                annotatedSampleSet.samples,
                validationOptions
            );

            const orderDTO: OrderDTO = this.fromSampleCollectionToOrderDTO(
                validatedSamples,
                annotatedSampleSet.meta
            );

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

            const sampleFile: ExcelFileInfo = await this.sampleService.convertToExcel(
                {
                    samples: validatedSamples,
                    meta: annotatedSampleSet.meta
                }
            );
            sampleFile.fileName = this.amendXLSXFileName(
                sampleFile.fileName,
                '_validated'
            );
            const attachment: Attachment = this.fromExcelFileInfoToAttachment(
                sampleFile
            );
            const token = getTokenFromHeader(req);
            if (!token) {
                throw new TokenNotFoundError('Invalid user.');
            }
            const user: User = await this.getUserFromToken(token);
            const senderInfo = this.tryParseInputDTO(() => {
                return this.fromPostSubmittedRequestDTOToSenderInfo(
                    requestDTO,
                    user
                );
            });
            this.sampleService.sendSampleFile(attachment, senderInfo);

            logger.info(
                `${this.constructor.name}.${
                    this.postSubmitted.name
                }, Response sent`
            );
            logger.verbose('Response:', responseDTO);
            this.ok(res, responseDTO);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${
                    this.postSubmitted.name
                } has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private async transformInput(
        req: Request,
        res: Response
    ): Promise<SampleSet> {
        let contype = req.headers['content-type'];
        const type = this.getResourceViewType(contype);
        const token: string | null = getTokenFromHeader(req);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const file = this.tryParseInputDTO(() => {
                    return {
                        buffer: req.file.buffer,
                        name: req.file.originalname
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
                return this.tryParseInputDTO(() => {
                    return this.fromDTOToSampleSet(dto.order.sampleSet);
                });
        }
    }

    private async sendResponse(
        req: Request,
        res: Response,
        sampleSet: SampleSet
    ) {
        let accept = req.headers['accept'];

        const type = this.getResourceViewType(accept);
        switch (type) {
            case RESOURCE_VIEW_TYPE.XLSX:
                const result: PutSamplesXLSXResponseDTO = await this.sampleService.convertToExcel(
                    sampleSet
                );
                result.fileName = this.amendXLSXFileName(
                    result.fileName,
                    '.MP_' + moment().unix()
                );
                logger.info(
                    `${this.constructor.name}.${
                        this.putSamples.name
                    }, Response sent`
                );
                this.ok(res, result);
                break;
            case RESOURCE_VIEW_TYPE.JSON:
            default:
                const successResponse: PutSamplesJSONResponseDTO = {
                    order: this.fromAnnotatedSampleSetToOrderDTO(sampleSet)
                };
                logger.info(
                    `${this.constructor.name}.${
                        this.putSamples.name
                    }, Response sent`
                );
                this.ok(res, successResponse);
        }
    }

    private amendXLSXFileName(
        originalFileName: string,
        fileNameAddon: string
    ): string {
        const entries: string[] = originalFileName.split('.xlsx');
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }

        fileName += fileNameAddon + '.xlsx';
        return fileName;
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
        const autocorrectedSamples = await this.formAutoCorrectionService.applyAutoCorrection(
            samples
        );

        const assignedSamples = this.nrlService.assignNRLsToSamples(
            autocorrectedSamples
        );

        const validationResult = await this.formValidationService.validateSamples(
            assignedSamples,
            options
        );

        return validationResult;
    }

    private async getValidationOptions(
        meta: SampleSetMetaData,
        req: Request
    ): Promise<ValidationOptions> {
        const validationOptions: ValidationOptions = {
            nrl: DefaultNRLService.mapNRLStringToEnum(meta.nrl)
        };

        const token = getTokenFromHeader(req);
        let stateShort = '';
        if (token) {
            const user: User = await this.getUserFromToken(token);
            try {
                const instute = user.institution;
                stateShort = instute.stateShort;
            } catch (error) {
                logger.info(
                    `${this.constructor.name}.${
                        this.getValidationOptions.name
                    }, no state found for user. Using default state. error=${error}`
                );
            }
        }

        validationOptions.state = stateShort;
        return validationOptions;
    }

    private getUserFromToken(token: string): Promise<User> {
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const userId = payload.sub;
        return this.userService.getUserById(userId);
    }

    private fromDTOToUnannotatedSampleSet(dto: SampleSetDTO): SampleSet {
        const cleanedDto: SampleSetDTO = {
            meta: dto.meta,
            samples: dto.samples.map(entry => {
                const e = entry;
                for (const prop in e.sampleData) {
                    e.sampleData[prop] = {
                        value: e.sampleData[prop].value
                    };
                }
                return e;
            })
        };
        return this.fromDTOToSampleSet(cleanedDto);
    }

    private fromDTOToSampleSet(dto: SampleSetDTO): SampleSet {
        const annotatedSampleSet: SampleSet = {
            meta: this.fromDTOToSampleSetMetaData(dto.meta),
            samples: dto.samples.map(container => {
                return this.fromSampleDataDTOToSample(container.sampleData);
            })
        };
        return annotatedSampleSet;
    }

    private fromDTOToSampleSetMetaData(
        dto: SampleSetMetaDTO
    ): SampleSetMetaData {
        return {
            nrl: DefaultNRLService.mapNRLStringToEnum(dto.nrl),
            analysis: dto.analysis,
            sender: dto.sender,
            urgency: this.fromUrgencyStringToEnum(dto.urgency),
            fileName: dto.fileName ? dto.fileName : ''
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
            nrl: data.nrl,
            analysis: data.analysis,
            sender: data.sender,
            urgency: data.urgency.toString(),
            fileName: data.fileName
        };
    }

    private fromSampleDataDTOToSample(dto: SampleDataDTO): Sample {
        const annotatedSample = this.fromDTOToAnnotatedSampleData(dto);
        return createSample({ ...annotatedSample });
    }

    private fromDTOToAnnotatedSampleData(dto: SampleDataDTO): SampleData {
        const annotatedSampleData: Record<
            string,
            AnnotatedSampleDataEntry
        > = {};
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

        if (dto.oldValue) {
            annotatedSampleDataEntry.oldValue = dto.oldValue;
        }

        return annotatedSampleDataEntry;
    }

    private fromExcelFileInfoToAttachment(
        excelInfo: ExcelFileInfo
    ): Attachment {
        return {
            filename: excelInfo.fileName,
            contentType: excelInfo.type,
            content: Buffer.from(excelInfo.data, 'base64')
        };
    }

    private fromAnnotatedSampleSetToOrderDTO(
        annotatedSampleSet: SampleSet
    ): OrderDTO {
        return {
            sampleSet: {
                meta: this.fromSampleSetMetaDataToDTO(annotatedSampleSet.meta),
                samples: annotatedSampleSet.samples.map(sample => ({
                    sampleData: sample.getDataValues(),
                    sampleMeta: sample.getSampleMetaData()
                }))
            }
        };
    }

    private fromSampleCollectionToOrderDTO(
        sampleCollection: Sample[],
        meta: SampleSetMetaData
    ): OrderDTO {
        return {
            sampleSet: this.fromSampleCollectionToSampleSetDTO(
                sampleCollection,
                meta
            )
        };
    }

    private fromSampleCollectionToSampleSetDTO(
        sampleCollection: Sample[],
        meta: SampleSetMetaData
    ): SampleSetDTO {
        return {
            samples: this.fromSampleCollectionToSampleDTO(sampleCollection),
            meta: this.fromSampleSetMetaDataToDTO(meta)
        };
    }
    private fromSampleCollectionToSampleDTO(
        sampleCollection: Sample[]
    ): SampleDTO[] {
        return sampleCollection.map((sample: Sample) => ({
            sampleData: sample.getAnnotatedData(),
            sampleMeta: this.fromSampleMetaToSampleMetaDTO(
                sample.getSampleMetaData()
            )
        }));
    }

    private fromSampleMetaToSampleMetaDTO(meta: SampleMetaData): SampleMetaDTO {
        return {
            nrl: meta.nrl.toString()
        };
    }

    private fromPostSubmittedRequestDTOToSenderInfo(
        requestDTO: PostSubmittedRequestDTO,
        user: User
    ): SenderInfo {
        return {
            user,
            comment: requestDTO.comment || '',
            recipient: requestDTO.order.sampleSet.meta.nrl || ''
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
