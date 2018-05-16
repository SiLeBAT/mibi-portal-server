import * as config from 'config';
import { IDatasetFile, ISenderInfo } from '..';
import { INotificationService } from '../../sharedKernel/application';
import { NotificationType } from '../../sharedKernel/domain/enums';

// TODO: Should these be here?  Should they not be added later?
const APP_NAME = config.get('appName');
const JOB_RECIPIENT = config.get('jobRecipient');

export interface IDatasetPort {
    sendDatasetFile(dataset: IDatasetFile, senderInfo: ISenderInfo): void;
}

export interface IDatasetService extends IDatasetPort { }

class DatasetService implements IDatasetService {

    constructor(private notificationService: INotificationService) { }

    sendDatasetFile(dataset: IDatasetFile, senderInfo: ISenderInfo): void {
        const newDatasetNotification = this.createNewDatasetNotification(dataset, senderInfo);
        return this.notificationService.sendNotification(newDatasetNotification);
    }

    private createNewDatasetNotification(dataset: IDatasetFile, senderInfo: ISenderInfo) {
        return {
            type: NotificationType.REQUEST_JOB,
            title: `Neuer Auftrag`,
            payload: {
                'appName': APP_NAME,
                'firstName': senderInfo.firstName,
                'lastName': senderInfo.lastName,
                'email': senderInfo.email,
                'institution': senderInfo.institution,
                'location': senderInfo.location
            },
            meta: {
                email: JOB_RECIPIENT,
                cc: [senderInfo.email],
                attachments: [dataset]
            }
        };
    }

}

export function createService(service: INotificationService): IDatasetService {
    return new DatasetService(service);
}
