import { NotificationType } from '../domain/enums';

export interface Notification {
    type: NotificationType;
    title: string;
    payload?: NotificationPayload;
    // tslint:disable-next-line
    meta?: any;
}

export interface NotificationPayload {
    // tslint:disable-next-line
    [key: string]: any;
}

export interface NotificationPort {
    addHandler(handler: Function): void;
}

export interface NotificationService extends NotificationPort {
    sendNotification(notification: Notification): void;
}
