import { NotificationType } from './../../app/ports';

interface Attachment {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface EmailData {
    type: NotificationType;
    meta: MailOptions;
    payload: Record<string, string>;
}
export interface MailConfiguration {
    fromAddress: string;
    replyToAddress: string;
}

export interface MailOptions {
    replyTo: string;
    from: string;
    to: string;
    cc: string[];
    subject: string;
    attachments: Attachment[];
}

export type MailHandler = (data: EmailData) => Promise<void>;

export interface MailService {
    getMailHandler(): MailHandler;
}
