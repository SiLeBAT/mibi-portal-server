import { Container } from 'inversify';
import {
    Notification,
    NotificationMeta,
    NotificationService
} from './core/model/notification.model';
import { APPLICATION_TYPES } from './application.types';

export interface MiBiApplication {
    addNotificationHandler<T, V extends NotificationMeta>(
        handler: (notification: Notification<T, V>) => void
    ): void;
}

export function createApplication(container: Container) {
    const notificationService: NotificationService =
        container.get<NotificationService>(
            APPLICATION_TYPES.NotificationService
        );
    return {
        addNotificationHandler: <T, V extends NotificationMeta>(
            handler: (notification: Notification<T, V>) => void
        ) => {
            notificationService.addHandler(handler);
        }
    };
}
