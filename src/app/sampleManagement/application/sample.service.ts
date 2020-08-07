import { logger } from '../../../aspects';
import {
    SampleService,
    OrderNotificationMetaData,
    ApplicantMetaData,
    NewDatasetNotificationPayload,
    NewDatasetCopyNotificationPayload,
    SampleSet,
    Sample
} from '../model/sample.model';
import {
    NotificationService,
    Notification,
    EmailNotificationMeta,
    Attachment
} from '../../core/model/notification.model';
import { NotificationType } from '../../core/domain/enums';
import {
    ExcelUnmarshalPort,
    JSONMarshalService,
    ExcelFileInfo
} from '../model/excel.model';
import { TokenService } from '../../authentication/model/token.model';
import { UnauthorizedError } from 'express-jwt';
import { ConfigurationService } from '../../core/model/configuration.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
import moment from 'moment';
import { NRL_ID, ReceiveAs } from '../domain/enums';
import { NRLService } from '../model/nrl.model';
import { FileBuffer } from '../../core/model/file.model';
import { PDFCreatorService } from '../model/pdf.model';
import {
    SampleSheetService,
    SampleSheet,
    SampleSheetAnalysisOption,
    SampleSheetAnalysis
} from '../model/sample-sheet.model';

interface Payload {
    buffer: Buffer;
    fileName: string;
    mime: string;
    nrl: NRL_ID;
}

@injectable()
export class DefaultSampleService implements SampleService {
    private appName: string;
    private overrideRecipient: string;

    private readonly ENCODING = 'base64';
    private readonly DEFAULT_FILE_NAME = 'Einsendebogen';
    private readonly IMPORTED_FILE_EXTENSION = '.xlsx';

    constructor(
        @inject(APPLICATION_TYPES.NotificationService)
        private notificationService: NotificationService,
        @inject(APPLICATION_TYPES.ExcelUnmarshalService)
        private excelUnmarshalService: ExcelUnmarshalPort,
        @inject(APPLICATION_TYPES.TokenService)
        private tokenService: TokenService,
        @inject(APPLICATION_TYPES.ConfigurationService)
        private configurationService: ConfigurationService,
        @inject(APPLICATION_TYPES.JSONMarshalService)
        private jsonMarshalService: JSONMarshalService,
        @inject(APPLICATION_TYPES.PDFCreatorService)
        private pdfCreatorService: PDFCreatorService,
        @inject(APPLICATION_TYPES.NRLService)
        private nrlService: NRLService,
        @inject(APPLICATION_TYPES.SampleSheetService)
        private sampleSheetService: SampleSheetService
    ) {
        this.appName = this.configurationService.getApplicationConfiguration().appName;
        this.overrideRecipient = this.configurationService.getApplicationConfiguration().jobRecipient;
    }

    async sendSamples(
        sampleSet: SampleSet,
        applicantMetaData: ApplicantMetaData
    ): Promise<void> {
        const splittedSampleSets = this.splitSampleSet(sampleSet);
        const nrlSampleSets = splittedSampleSets.map(sampleSet =>
            this.createNRLSampleSet(sampleSet)
        );

        const nrlPayloads = await this.createPayloads(
            nrlSampleSets,
            sampleSheet => this.jsonMarshalService.createExcel(sampleSheet)
        );

        let userPayloads: Payload[];
        switch (applicantMetaData.receiveAs) {
            case ReceiveAs.PDF:
                userPayloads = await this.createPayloads(
                    splittedSampleSets,
                    sampleSheet => this.pdfCreatorService.createPDF(sampleSheet)
                );
                break;
            case ReceiveAs.EXCEL:
            default:
                userPayloads = nrlPayloads;
                break;
        }

        this.sendToNRLs(nrlPayloads, applicantMetaData);
        this.sendToUser(userPayloads, applicantMetaData);
    }

    async convertToJson(
        buffer: Buffer,
        fileName: string,
        token: string | null
    ): Promise<SampleSet> {
        const sampleSheet = await this.excelUnmarshalService.convertExcelToJSJson(
            buffer,
            fileName
        );

        if (token) {
            try {
                this.tokenService.verifyToken(token);
            } catch (error) {
                if (error instanceof UnauthorizedError) {
                    logger.info(
                        `${this.constructor.name}.${this.convertToJson.name}, unable to determine user origin because of invalid token. error=${error}`
                    );
                } else {
                    throw error;
                }
            }
        }
        return this.sampleSheetService.fromSampleSheetToSampleSet(sampleSheet);
    }

    async convertToExcel(sampleSet: SampleSet): Promise<ExcelFileInfo> {
        const sampleSheet = this.sampleSheetService.fromSampleSetToSampleSheet(
            sampleSet
        );

        this.prepareSampleSheetForExport(sampleSheet);

        const fileBuffer = await this.jsonMarshalService.createExcel(
            sampleSheet
        );

        const fileName = this.amendFileName(
            sampleSet.meta.fileName || this.DEFAULT_FILE_NAME,
            '.MP_' + moment().unix().toString(),
            fileBuffer.extension
        );

        return {
            data: fileBuffer.buffer.toString(this.ENCODING),
            fileName: fileName,
            type: fileBuffer.mimeType
        };
    }

    private prepareSampleSheetForExport(sampleSheet: SampleSheet): void {
        const keys: Exclude<
            keyof SampleSheetAnalysis,
            'compareHumanText' | 'otherText'
        >[] = [
            'species',
            'serological',
            'phageTyping',
            'resistance',
            'vaccination',
            'molecularTyping',
            'toxin',
            'zoonosenIsolate',
            'esblAmpCCarbapenemasen',
            'other',
            'compareHuman'
        ];

        const analysis = sampleSheet.meta.analysis;
        keys.forEach(key => {
            if (analysis[key] === SampleSheetAnalysisOption.STANDARD) {
                analysis[key] = SampleSheetAnalysisOption.ACTIVE;
            }
        });
    }

    private splitSampleSet(sampleSet: SampleSet): SampleSet[] {
        let splittedSampleSetMap = new Map<string, SampleSet>();
        sampleSet.samples.forEach(sample => {
            const nrl = sample.getNRL();
            let splittedSampleSet = splittedSampleSetMap.get(nrl);
            if (!splittedSampleSet) {
                splittedSampleSet = {
                    samples: [],
                    meta: { ...sampleSet.meta }
                };
                splittedSampleSetMap.set(nrl, splittedSampleSet);
            }
            splittedSampleSet.samples.push(sample);
        });
        return Array.from(splittedSampleSetMap.values());
    }

    private async createPayloads(
        sampleSets: SampleSet[],
        creatorFunc: (sampleSheet: SampleSheet) => Promise<FileBuffer>
    ): Promise<Payload[]> {
        return Promise.all(
            sampleSets.map(async sampleSet =>
                this.createPayload(sampleSet, creatorFunc)
            )
        );
    }

    private async createPayload(
        sampleSet: SampleSet,
        creatorFunc: (sampleSheet: SampleSheet) => Promise<FileBuffer>
    ): Promise<Payload> {
        const sampleSheet = this.sampleSheetService.fromSampleSetToSampleSheet(
            sampleSet
        );

        const fileBuffer = await creatorFunc(sampleSheet);

        const nrl = sampleSet.samples[0].getNRL();

        const fileName = this.amendFileName(
            sampleSet.meta.fileName || this.DEFAULT_FILE_NAME,
            '_' + nrl + '_validated',
            fileBuffer.extension
        );

        return {
            buffer: fileBuffer.buffer,
            fileName: fileName,
            mime: fileBuffer.mimeType,
            nrl: nrl
        };
    }

    private sendToNRLs(
        payloads: Payload[],
        applicantMetaData: ApplicantMetaData
    ): void {
        payloads.forEach(payload => {
            const orderNotificationMetaData = this.resolveOrderNotificationMetaData(
                applicantMetaData,
                payload.nrl
            );

            const newOrderNotification = this.createNewOrderNotification(
                this.createNotificationAttachment(payload),
                orderNotificationMetaData
            );

            this.notificationService.sendNotification(newOrderNotification);
        });
    }

    private sendToUser(
        payloads: Payload[],
        applicantMetaData: ApplicantMetaData
    ): void {
        const attachments = payloads.map(file =>
            this.createNotificationAttachment(file)
        );

        const newOrderCopyNotification = this.createNewOrderCopyNotification(
            attachments,
            applicantMetaData
        );

        this.notificationService.sendNotification(newOrderCopyNotification);
    }

    private createNotificationAttachment(payload: Payload): Attachment {
        return {
            filename: payload.fileName,
            content: payload.buffer,
            contentType: payload.mime
        };
    }

    private resolveOrderNotificationMetaData(
        applicantMetaData: ApplicantMetaData,
        nrl: NRL_ID
    ): OrderNotificationMetaData {
        return {
            ...applicantMetaData,
            recipient: {
                email: this.nrlService.getEmailForNRL(nrl),
                name: nrl.toString()
            }
        };
    }

    private createNewOrderCopyNotification(
        datasets: Attachment[],
        applicantMetaData: ApplicantMetaData
    ): Notification<NewDatasetCopyNotificationPayload, EmailNotificationMeta> {
        const fullName = applicantMetaData.user.getFullName();
        return {
            type: NotificationType.NOTIFICATION_SENT,
            payload: {
                appName: this.appName,
                name: fullName,
                comment: applicantMetaData.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                applicantMetaData.user.email,
                `Neuer Auftrag an das BfR`,
                [],
                datasets
            )
        };
    }

    private createNewOrderNotification(
        dataset: Attachment,
        orderNotificationMetaData: OrderNotificationMetaData
    ): Notification<NewDatasetNotificationPayload, EmailNotificationMeta> {
        return {
            type: NotificationType.REQUEST_JOB,

            payload: {
                appName: this.appName,
                firstName: orderNotificationMetaData.user.firstName,
                lastName: orderNotificationMetaData.user.lastName,
                email: orderNotificationMetaData.user.email,
                institution: orderNotificationMetaData.user.institution,
                comment: orderNotificationMetaData.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                this.overrideRecipient
                    ? this.overrideRecipient
                    : orderNotificationMetaData.recipient.email,
                `Neuer Auftrag von ${orderNotificationMetaData.user.institution
                    .city || '<unbekannt>'} an ${orderNotificationMetaData
                    .recipient.name || '<unbekannt>'}`,
                [],
                [dataset]
            )
        };
    }

    private amendFileName(
        originalFileName: string,
        fileNameAddon: string,
        fileExtension: string
    ): string {
        const entries: string[] = originalFileName.split(
            this.IMPORTED_FILE_EXTENSION
        );
        let fileName: string = '';
        if (entries.length > 0) {
            fileName += entries[0];
        }
        fileName += fileNameAddon + fileExtension;
        fileName = fileName.replace(' ', '_');
        return fileName;
    }

    private createNRLSampleSet(sampleSet: SampleSet): SampleSet {
        const nrlSampleSet: SampleSet = {
            meta: sampleSet.meta,
            samples: sampleSet.samples.map(sample => sample.clone())
        };

        nrlSampleSet.samples.forEach(sample => {
            this.replaceEmptySampleIDWithSampleIDAVV(sample);
        });

        return nrlSampleSet;
    }

    private replaceEmptySampleIDWithSampleIDAVV(sample: Sample) {
        const sampleData = sample.getAnnotatedData();
        const sampleID = sampleData.sample_id.value;
        const sampleIDAVV = sampleData.sample_id_avv.value;
        if (!sampleID && sampleIDAVV) {
            sampleData.sample_id.value = sampleIDAVV;
            sampleData.sample_id.oldValue = '';
        }
    }
}
