import { logger } from '../../../aspects';
import {
    SampleService,
    ResolvedSenderInfo,
    SenderInfo,
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
import { NRL } from '../domain/enums';
import { NRLService } from '../model/nrl.model';

@injectable()
export class DefaultSampleService implements SampleService {
    private appName: string;
    private defaultJobRecipient: string;
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
        @inject(APPLICATION_TYPES.NRLService)
        private nrlService: NRLService
    ) {
        this.appName = this.configurationService.getApplicationConfiguration().appName;
        this.defaultJobRecipient = this.configurationService.getApplicationConfiguration().jobRecipient;
    }

    async sendSamples(
        sampleSet: SampleSet,
        senderInfo: SenderInfo
    ): Promise<void> {
        const nrlSampleSets: SampleSet[] = this.splitSampleSet(sampleSet);

        const attachments: Attachment[] = await Promise.all(
            nrlSampleSets.map(async nrlSampleSet => {
                const fileInfo: ExcelFileInfo = await this.jsonMarshalService.convertJSONToExcel(
                    nrlSampleSet
                );
                fileInfo.fileName = this.amendXLSXFileName(
                    fileInfo.fileName,
                    '_' + nrlSampleSet.meta.nrl + '_validated'
                );
                const attachment: Attachment = this.createNotificationAttachment(
                    fileInfo
                );

                const resolvedSenderInfo = this.resolveSenderInfo(
                    senderInfo,
                    nrlSampleSet.meta.nrl
                );

                const newOrderNotification = this.createNewOrderNotification(
                    [attachment],
                    resolvedSenderInfo
                );
                this.notificationService.sendNotification(newOrderNotification);

                return attachment;
            })
        );

        const newOrderCopyNotification = this.createNewOrderCopyNotification(
            attachments,
            senderInfo
        );
        this.notificationService.sendNotification(newOrderCopyNotification);
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
                        `${this.constructor.name}.${
                            this.convertToJson.name
                        }, unable to determine user origin because of invalid token. error=${error}`
                    );
                } else {
                    throw error;
                }
            }
        }
        return sampleSet;
    }

    async convertToExcel(sampleSet: SampleSet): Promise<ExcelFileInfo> {
        const result: ExcelFileInfo = await this.jsonMarshalService.convertJSONToExcel(
            sampleSet
        );
        result.fileName = this.amendXLSXFileName(
            result.fileName,
            '.MP_' + moment().unix()
        );
        return result;
    }

    private splitSampleSet(sampleSet: SampleSet): SampleSet[] {
        let sampleSetMap = new Map<string, SampleSet>();
        sampleSet.samples.forEach(sample => {
            const nrl = sample.getSampleMetaData().nrl;
            let nrlSampleSet = sampleSetMap.get(nrl);
            if (!nrlSampleSet) {
                nrlSampleSet = {
                    samples: [],
                    meta: { ...sampleSet.meta, nrl: nrl }
                };
                sampleSetMap.set(nrl, nrlSampleSet);
            }
            nrlSampleSet.samples.push(sample);
        });
        return Array.from(sampleSetMap.values());
    }

    private resolveSenderInfo(
        senderInfo: SenderInfo,
        nrl: NRL
    ): ResolvedSenderInfo {
        const email: string = this.nrlService.getEmailForNRL(nrl);
        return {
            user: senderInfo.user,
            comment: senderInfo.comment,
            recipient: {
                email,
                name: nrl.toString()
            }
        };
    }

    private createNotificationAttachment(excelInfo: ExcelFileInfo): Attachment {
        return {
            filename: excelInfo.fileName,
            contentType: excelInfo.type,
            content: Buffer.from(excelInfo.data, 'base64')
        };
    }

    private createNewOrderCopyNotification(
        datasets: Attachment[],
        senderInfo: SenderInfo
    ): Notification<NewDatasetCopyNotificationPayload, EmailNotificationMeta> {
        const fullName = senderInfo.user.getFullName();
        return {
            type: NotificationType.NOTIFICATION_SENT,
            payload: {
                appName: this.appName,
                name: fullName,
                comment: senderInfo.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                senderInfo.user.email,
                `Neuer Auftrag an das BfR`,
                [],
                datasets
            )
        };
    }

    private createNewOrderNotification(
        datasets: Attachment[],
        senderInfo: ResolvedSenderInfo
    ): Notification<NewDatasetNotificationPayload, EmailNotificationMeta> {
        return {
            type: NotificationType.REQUEST_JOB,

            payload: {
                appName: this.appName,
                firstName: senderInfo.user.firstName,
                lastName: senderInfo.user.lastName,
                email: senderInfo.user.email,
                institution: senderInfo.user.institution,
                comment: senderInfo.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                senderInfo.recipient.email
                    ? senderInfo.recipient.email
                    : this.defaultJobRecipient,
                `Neuer Auftrag von ${senderInfo.user.institution.city ||
                    '<unbekannt>'} an ${senderInfo.recipient.name ||
                    '<unbekannt>'}`,
                [],
                datasets
            )
        };
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
        fileName = fileName.replace(' ', '_');
        return fileName;
    }
}
