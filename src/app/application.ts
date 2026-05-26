import { Container } from 'inversify';
import {
    NotificationService,
    NotificationHandler
} from './core/model/notification.model';
import { APPLICATION_TYPES } from './application.types';

export interface MiBiApplication {
    addNotificationHandler(handler: NotificationHandler): void;
}

export function createApplication(container: Container) {
    const notificationService: NotificationService =
        container.get<NotificationService>(
            APPLICATION_TYPES.NotificationService
        );
    return {
        addNotificationHandler: (handler: NotificationHandler) => {
            notificationService.addHandler(handler);
        }
    };
}
