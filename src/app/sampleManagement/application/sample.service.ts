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
import { User } from '../../authentication/model/user.model';
import { Institute } from '../../authentication/model/institute.model';
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

@injectable()
export class DefaultSampleService implements SampleService {
    private appName: string;
    private jobRecipient: string;
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
        private jsonMarshalService: JSONMarshalService
    ) {
        this.appName = this.configurationService.getApplicationConfiguration().appName;
        this.jobRecipient = this.configurationService.getApplicationConfiguration().jobRecipient;
    }

    async sendSamples(sampleSet: SampleSet, senderInfo: SenderInfo): Promise<void> {
        const nrlSampleSets: SampleSet[] = this.splitSampleSet(sampleSet);

        const sampleFiles: ExcelFileInfo[] = await Promise.all(nrlSampleSets.map(async (nrlSampleSet) => {
            let sampleFile: ExcelFileInfo = await this.jsonMarshalService.convertJSONToExcel(nrlSampleSet);
            sampleFile.fileName = this.amendXLSXFileName(sampleFile.fileName, '_' + nrlSampleSet.meta.nrl + '_validated');
            return sampleFile;
        }));
        
        const attachments: Attachment[] = sampleFiles.map((fileInfo) => this.createNotificationAttachment(fileInfo));
        const resolvedSenderInfo = this.ResolveSenderInfo(senderInfo);
       
        const newSampleCopyNotification = this.createNewSampleCopyNotification(
            attachments,
            resolvedSenderInfo
        );
        this.notificationService.sendNotification(newSampleCopyNotification);

        const newSampleNotification = this.createNewSampleNotification(
            attachments,
            resolvedSenderInfo
        );
        this.notificationService.sendNotification(newSampleNotification);
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
        const result: ExcelFileInfo = await this.jsonMarshalService.convertJSONToExcel(sampleSet);
        result.fileName = this.amendXLSXFileName(
            result.fileName,
            '.MP_' + moment().unix()
        );
        return result;
    }

    private splitSampleSet(sampleSet: SampleSet): SampleSet[] {
            let sampleSetMap = new Map<string, SampleSet>();
            sampleSet.samples.forEach((sample) => {
                const nrl = sample.getSampleMetaData().nrl;
                let nrlSampleSet = sampleSetMap.get(nrl);
                if(!nrlSampleSet) {
                    nrlSampleSet = {
                        samples: [],
                        meta: {...sampleSet.meta, nrl: nrl }
                    }
                    sampleSetMap.set(nrl, nrlSampleSet);
                }
                nrlSampleSet.samples.push(sample);
            });
            return Array.from(sampleSetMap.values());
    }

    private ResolveSenderInfo(senderInfo: SenderInfo): ResolvedSenderInfo {
        const sender: User = senderInfo.user;
        const institution: Institute = sender.institution;
        if (institution.name === 'dummy') {
            logger.warn(
                `${this.constructor.name}.${
                    this.sendSamples.name
                }, user assigned to dummy institute. User=${sender.uniqueId}`
            );
        }
        return {
            user: sender,
            institute: institution,
            comment: senderInfo.comment,
            recipient: senderInfo.recipient
        };
    }
    
    private createNotificationAttachment(
        excelInfo: ExcelFileInfo
    ): Attachment {
        return {
            filename: excelInfo.fileName,
            contentType: excelInfo.type,
            content: Buffer.from(excelInfo.data, 'base64')
        };
    }

    private createNewSampleCopyNotification(
        datasets: Attachment[],
        senderInfo: ResolvedSenderInfo
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

    private createNewSampleNotification(
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
                this.jobRecipient,
                `Neuer Auftrag von ${senderInfo.institute.city ||
                    '<unbekannt>'} an ${senderInfo.recipient || '<unbekannt>'}`,
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
        return fileName;
    }
}
