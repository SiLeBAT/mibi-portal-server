import * as config from 'config';
import { IDatasetFile } from '..';
import { INotificationService } from '../../sharedKernel/application';
import { logger } from '../../../aspects';
import { NotificationType } from '../../sharedKernel/domain/enums';

// TODO: Should these be here?  Should they not be added later?
const APP_NAME = config.get('appName');
const JOB_RECIPIENT = config.get('jobRecipient');

export interface IDatasetPort {
    sendDatasetFile(dataset: IDatasetFile): void;
}

export interface IDatasetService extends IDatasetPort { }

class DatasetService implements IDatasetService {

    constructor(private notificationService: INotificationService) { }

    sendDatasetFile(dataset: IDatasetFile): void {
        const newDatasetNotification = this.createNewDatasetNotification(dataset);
        return this.notificationService.sendNotification(newDatasetNotification);
    }

    private createNewDatasetNotification(dataset: IDatasetFile) {
        return {
            type: NotificationType.REQUEST_JOB,
            title: `Neuer Auftrag`,
            payload: {
                'appName': APP_NAME
            },
            meta: {
                email: JOB_RECIPIENT,
                attachments: [dataset]
            }
        };
    }

}

export function createService(service: INotificationService): IDatasetService {
    return new DatasetService(service);
}
