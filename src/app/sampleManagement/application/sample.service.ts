import { logger } from '../../../aspects';
import {
    SampleService,
    OrderNotificationMetaData,
    ApplicantMetaData,
    NewDatasetNotificationPayload,
    NewDatasetCopyNotificationPayload,
    SampleSet
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
import moment = require('moment');
import { NRL_ID, ReceiveAs } from '../domain/enums';
import { NRLService } from '../model/nrl.model';
import { FileBuffer } from '../../core/model/file.model';
import { PDFCreatorService } from '../model/pdf.model';

interface SampleSheet {
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
        private nrlService: NRLService
    ) {
        this.appName = this.configurationService.getApplicationConfiguration().appName;
        this.overrideRecipient = this.configurationService.getApplicationConfiguration().jobRecipient;
    }

    async sendSamples(
        sampleSet: SampleSet,
        applicantMetaData: ApplicantMetaData
    ): Promise<void> {
        const splittedSampleSets = this.splitSampleSet(sampleSet);

        const nrlSampleSheets = await this.createSampleSheets(
            splittedSampleSets,
            sampleSet => this.jsonMarshalService.convertJSONToExcel(sampleSet)
        );

        let userSampleSheets: SampleSheet[];
        switch (applicantMetaData.receiveAs) {
            case ReceiveAs.PDF:
                userSampleSheets = await this.createSampleSheets(
                    splittedSampleSets,
                    sampleSet => this.pdfCreatorService.createPDF(sampleSet)
                );
                break;
            case ReceiveAs.EXCEL:
            default:
                userSampleSheets = nrlSampleSheets;
                break;
        }

        this.sendSamplesToNRLs(nrlSampleSheets, applicantMetaData);
        this.sendSamplesToUser(userSampleSheets, applicantMetaData);
    }

    async convertToJson(
        buffer: Buffer,
        fileName: string,
        token: string | null
    ): Promise<SampleSet> {
        const sampleSet: SampleSet = await this.excelUnmarshalService.convertExcelToJSJson(
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
        return sampleSet;
    }

    async convertToExcel(sampleSet: SampleSet): Promise<ExcelFileInfo> {
        const fileBuffer: FileBuffer = await this.jsonMarshalService.convertJSONToExcel(
            sampleSet
        );

        const fileName = this.amendFileName(
            sampleSet.meta.fileName || this.DEFAULT_FILE_NAME,
            '.MP_' + moment().unix(),
            fileBuffer.extension
        );

        return {
            data: fileBuffer.buffer.toString(this.ENCODING),
            fileName: fileName,
            type: fileBuffer.mimeType
        };
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

    private async createSampleSheets(
        sampleSets: SampleSet[],
        creatorFunc: (sampleSet: SampleSet) => Promise<FileBuffer>
    ): Promise<SampleSheet[]> {
        return Promise.all(
            sampleSets.map(async sampleSet =>
                this.createSampleSheet(sampleSet, creatorFunc)
            )
        );
    }

    private async createSampleSheet(
        sampleSet: SampleSet,
        creatorFunc: (sampleSet: SampleSet) => Promise<FileBuffer>
    ): Promise<SampleSheet> {
        const fileBuffer = await creatorFunc(sampleSet);

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

    private sendSamplesToNRLs(
        sampleSheets: SampleSheet[],
        applicantMetaData: ApplicantMetaData
    ): void {
        sampleSheets.forEach(sampleSheet => {
            const orderNotificationMetaData = this.resolveOrderNotificationMetaData(
                applicantMetaData,
                sampleSheet.nrl
            );

            const newOrderNotification = this.createNewOrderNotification(
                this.createNotificationAttachment(sampleSheet),
                orderNotificationMetaData
            );

            this.notificationService.sendNotification(newOrderNotification);
        });
    }

    private sendSamplesToUser(
        sampleSheets: SampleSheet[],
        applicantMetaData: ApplicantMetaData
    ): void {
        const attachments = sampleSheets.map(sampleSheet =>
            this.createNotificationAttachment(sampleSheet)
        );

        const newOrderCopyNotification = this.createNewOrderCopyNotification(
            attachments,
            applicantMetaData
        );

        this.notificationService.sendNotification(newOrderCopyNotification);
    }

    private createNotificationAttachment(sampleSheet: SampleSheet): Attachment {
        return {
            filename: sampleSheet.fileName,
            content: sampleSheet.buffer,
            contentType: sampleSheet.mime
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
}
