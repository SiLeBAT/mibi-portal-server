import {
    Notification,
    NotificationMeta,
    NotificationService
} from './core/model/notification.model';

export interface MiBiApplication {
    addNotificationHandler<T, V extends NotificationMeta>(
        handler: (notification: Notification<T, V>) => void
    ): void;
}

export function createApplication(
    notificationService: NotificationService
): MiBiApplication {
    return {
        addNotificationHandler: <T, V extends NotificationMeta>(
            handler: (notification: Notification<T, V>) => void
        ) => {
            notificationService.addHandler(handler);
        }
    };
}
