import { logger } from '../../../aspects';
import {
    DatasetService,
    ResolvedSenderInfo,
    DatasetFile,
    SenderInfo,
    NewDatasetNotificationPayload,
    NewDatasetCopyNotificationPayload
} from '../model/sample.model';
import {
    NotificationService,
    Notification,
    EmailNotificationMeta
} from '../../core/model/notification.model';
import { getConfigurationService } from '../../core/application/configuration.service';
import { User } from '../../authentication/model/user.model';
import { Institute } from '../../authentication/model/institute.model';
import { NotificationType } from '../../core/domain/enums';
import { InstituteRepository, UserRepository } from '../../ports';

const appConfig = getConfigurationService().getApplicationConfiguration();

const APP_NAME = appConfig.appName;
const JOB_RECIPIENT = appConfig.jobRecipient;

class DefaultDatasetService implements DatasetService {
    constructor(
        private notificationService: NotificationService,
        private instituteRepository: InstituteRepository,
        private userRepository: UserRepository
    ) {}

    async sendDatasetFile(
        dataset: DatasetFile,
        senderInfo: SenderInfo
    ): Promise<void> {
        const sender: User = await this.resolveUser(senderInfo.email);
        const institution: Institute = await this.resolveInstitute(
            senderInfo.instituteId
        );
        if (institution.name === 'dummy') {
            logger.warn(
                `User assigned to dummy institute. User=${sender.uniqueId}`
            );
        }
        const resolvedSenderInfo: ResolvedSenderInfo = {
            user: sender,
            institute: institution,
            comment: senderInfo.comment,
            recipient: senderInfo.recipient
        };
        const newDatasetCopyNotification = this.createNewDatasetCopyNotification(
            dataset,
            resolvedSenderInfo
        );
        this.notificationService.sendNotification(newDatasetCopyNotification);

        const newDatasetNotification = this.createNewDatasetNotification(
            dataset,
            resolvedSenderInfo
        );
        return this.notificationService.sendNotification(
            newDatasetNotification
        );
    }

    private resolveInstitute(id: string): Promise<Institute> {
        return this.instituteRepository.findById(id);
    }

    private resolveUser(email: string): Promise<User> {
        return this.userRepository.findByUsername(email);
    }

    private createNewDatasetCopyNotification(
        dataset: DatasetFile,
        senderInfo: ResolvedSenderInfo
    ): Notification<NewDatasetCopyNotificationPayload, EmailNotificationMeta> {
        const fullName = senderInfo.user.getFullName();
        return {
            type: NotificationType.NOTIFICATION_SENT,
            payload: {
                appName: APP_NAME,
                name: fullName,
                comment: senderInfo.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                senderInfo.user.email,
                `Neuer Auftrag an das BfR`,
                [],
                [dataset]
            )
        };
    }

    private createNewDatasetNotification(
        dataset: DatasetFile,
        senderInfo: ResolvedSenderInfo
    ): Notification<NewDatasetNotificationPayload, EmailNotificationMeta> {
        return {
            type: NotificationType.REQUEST_JOB,

            payload: {
                appName: APP_NAME,
                firstName: senderInfo.user.firstName,
                lastName: senderInfo.user.lastName,
                email: senderInfo.user.email,
                institution: senderInfo.user.institution,
                comment: senderInfo.comment
            },
            meta: this.notificationService.createEmailNotificationMetaData(
                JOB_RECIPIENT,
                `Neuer Auftrag von ${senderInfo.institute.city ||
                    '<unbekannt>'} an ${senderInfo.recipient || '<unbekannt>'}`,
                [],
                [dataset]
            )
        };
    }
}

export function createService(
    service: NotificationService,
    instituteRepository: InstituteRepository,
    userRepository: UserRepository
): DatasetService {
    return new DefaultDatasetService(
        service,
        instituteRepository,
        userRepository
    );
}
