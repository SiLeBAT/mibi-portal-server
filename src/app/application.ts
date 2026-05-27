import { Container } from 'inversify';
import { NotificationService } from './core/model/notification.model';
import { APPLICATION_TYPES } from './application.types';

export interface MiBiApplication {
    addNotificationHandler(handler: (...args: unknown[]) => void): void;
}

export function createApplication(container: Container) {
    const notificationService: NotificationService =
        container.get<NotificationService>(
            APPLICATION_TYPES.NotificationService
        );
    return {
        addNotificationHandler: (handler: (...args: unknown[]) => void) => {
            notificationService.addHandler(handler);
        }
    };
}
