import { EventEmitter } from 'events';
import { Notification, NotificationService } from '../model/notification.model';

class DefaultNotificationService implements NotificationService {
    private notificationName = 'mibi-notification';

    private sender: EventEmitter = new EventEmitter();

    sendNotification(notification: Notification): void {
        this.sender.emit(this.notificationName, notification);
    }

    addHandler(handler: (notification: Notification) => void): void {
        this.sender.on(this.notificationName, handler);
    }
}

const notificationService = new DefaultNotificationService();

function getNotificationService(): NotificationService {
    return notificationService;
}
export { getNotificationService };
