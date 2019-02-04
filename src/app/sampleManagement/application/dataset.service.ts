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

export interface IDatasetService extends IDatasetPort {}

class DatasetService implements IDatasetService {
	constructor(private notificationService: INotificationService) {}

	sendDatasetFile(dataset: IDatasetFile, senderInfo: ISenderInfo): void {
		const newDatasetCopyNotification = this.createNewDatasetCopyNotification(
			dataset,
			senderInfo
		);
		this.notificationService.sendNotification(newDatasetCopyNotification);

		const newDatasetNotification = this.createNewDatasetNotification(
			dataset,
			senderInfo
		);
		return this.notificationService.sendNotification(
			newDatasetNotification
		);
	}

	private createNewDatasetCopyNotification(
		dataset: IDatasetFile,
		senderInfo: ISenderInfo
	) {
		const fullName = senderInfo.firstName + ' ' + senderInfo.lastName;
		return {
			type: NotificationType.NOTIFICATION_SENT,
			title: `Neuer Auftrag an das BfR`,
			payload: {
				appName: APP_NAME,
				name: fullName
			},
			meta: {
				email: senderInfo.email,
				attachments: [dataset]
			}
		};
	}

	private createNewDatasetNotification(
		dataset: IDatasetFile,
		senderInfo: ISenderInfo
	) {
		return {
			type: NotificationType.REQUEST_JOB,
			title: `Neuer Auftrag`,
			payload: {
				appName: APP_NAME,
				firstName: senderInfo.firstName,
				lastName: senderInfo.lastName,
				email: senderInfo.email,
				institution: senderInfo.institution,
				location: senderInfo.location,
				comment: senderInfo.comment
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
