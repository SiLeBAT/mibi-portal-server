import { EventEmitter } from 'events';
import {
    Notification,
    NotificationService,
    NotificationMeta,
    EmailNotificationMeta,
    Attachment
} from '../model/notification.model';

class DefaultNotificationService implements NotificationService {
    private notificationName = 'mibi-notification';

    private sender: EventEmitter = new EventEmitter();

    sendNotification<T, V extends NotificationMeta>(
        notification: Notification<T, V>
    ): void {
        this.sender.emit(this.notificationName, notification);
    }

    addHandler<T, V extends NotificationMeta>(
        handler: (notification: Notification<T, V>) => void
    ): void {
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

const notificationService = new DefaultNotificationService();

function getNotificationService(): NotificationService {
    return notificationService;
}
export { getNotificationService };
