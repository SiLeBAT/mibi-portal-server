import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import { logger } from '../../../aspects';
import {
    Attachment,
    EmailNotificationMeta,
    Notification,
    NotificationMeta,
    NotificationService
} from '../model/notification.model';

@injectable()
export class DefaultNotificationService implements NotificationService {
    private notificationName = 'mibi-notification';

    private sender: EventEmitter = new EventEmitter();

    sendNotification<T, V extends NotificationMeta>(
        notification: Notification<T, V>
    ): void {
        logger.info(
            `${this.constructor.name}.${this.sendNotification.name}, sending notification.  notification.type=${notification.type}`
        );
        this.sender.emit(this.notificationName, notification);
    }

    addHandler<T, V extends NotificationMeta>(
        handler: (notification: Notification<T, V>) => void
    ): void {
        logger.info(
            `${this.constructor.name}.${this.addHandler.name}, adding handler to notification. notificationName=${this.notificationName}`
        );
        this.sender.on(this.notificationName, handler);
    }

    createEmailNotificationMetaData(
        to: string,
        subject: string,
        cc = [] as string[],
        attachments = [] as Attachment[]
    ): EmailNotificationMeta {
        return {
            to,
            subject,
            cc,
            attachments
        };
    }
}
