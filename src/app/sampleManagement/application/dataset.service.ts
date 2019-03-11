import * as config from 'config';
import { IDatasetFile, ISenderInfo } from '..';
import { INotificationService } from '../../sharedKernel/application';
import { NotificationType } from '../../sharedKernel/domain/enums';
import { User, InstituteRepository, UserRepository } from '../../ports';
import { Institute } from '../../authentication';
import { logger } from '../../../aspects';

const APP_NAME = config.get('appName');
const JOB_RECIPIENT = config.get('jobRecipient');

export interface IDatasetPort {
    sendDatasetFile(dataset: IDatasetFile, senderInfo: ISenderInfo): void;
}

export interface IDatasetService extends IDatasetPort {}

interface ResolvedSenderInfo {
    user: User;
    institute: Institute;
    comment: string;
    recipient: string;
}
class DatasetService implements IDatasetService {
    constructor(
        private notificationService: INotificationService,
        private instituteRepository: InstituteRepository,
        private userRepository: UserRepository
    ) {}

    async sendDatasetFile(
        dataset: IDatasetFile,
        senderInfo: ISenderInfo
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
        dataset: IDatasetFile,
        senderInfo: ResolvedSenderInfo
    ) {
        const fullName = senderInfo.user.getFullName();
        return {
            type: NotificationType.NOTIFICATION_SENT,
            title: `Neuer Auftrag an das BfR`,
            payload: {
                appName: APP_NAME,
                name: fullName,
                comment: senderInfo.comment
            },
            meta: {
                email: senderInfo.user.email,
                attachments: [dataset]
            }
        };
    }

    private createNewDatasetNotification(
        dataset: IDatasetFile,
        senderInfo: ResolvedSenderInfo
    ) {
        return {
            type: NotificationType.REQUEST_JOB,
            title: `Neuer Auftrag von ${senderInfo.institute.city ||
                '<unbekannt>'} an ${senderInfo.recipient || '<unbekannt>'}`,
            payload: {
                appName: APP_NAME,
                firstName: senderInfo.user.firstName,
                lastName: senderInfo.user.lastName,
                email: senderInfo.user.email,
                institution: senderInfo.user.institution,
                comment: senderInfo.comment
            },
            meta: {
                email: JOB_RECIPIENT,
                attachments: [dataset]
            }
        };
    }
}

export function createService(
    service: INotificationService,
    instituteRepository: InstituteRepository,
    userRepository: UserRepository
): IDatasetService {
    return new DatasetService(service, instituteRepository, userRepository);
}
