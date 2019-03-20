// core

// npm
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as readFilePromise from 'fs-readfile-promise';

// local
import { logger } from './../../aspects';
import {
    NotificationPort,
    NotificationType,
    Notification,
    DatasetFile,
    getConfigurationService,
    MailConfiguration
} from '../../app/ports';

interface MailOptions {
    to: string;
    cc: string[];
    subject: string;
    // tslint:disable-next-line
    attachments: any[];
}

const mailConfig: MailConfiguration = getConfigurationService().getMailConfiguration();

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

const viewsDir = __dirname + '/views/de/';

function registerListeners(notificationService: NotificationPort) {
    notificationService.addHandler(async (data: Notification) => {
        let templateFile;
        switch (data.type) {
            case NotificationType.RESET_SUCCESS:
                templateFile = await readFilePromise(
                    viewsDir + 'pwnotification.html'
                );
                break;
            case NotificationType.REQUEST_ACTIVATION:
                templateFile = await readFilePromise(
                    viewsDir + 'regactivation.html'
                );
                break;
            case NotificationType.REQUEST_ALTERNATIVE_CONTACT:
                templateFile = await readFilePromise(
                    viewsDir + 'pwresethelp.html'
                );
                break;
            case NotificationType.REQUEST_RESET:
                templateFile = await readFilePromise(viewsDir + 'pwreset.html');
                break;
            case NotificationType.REQUEST_JOB:
                templateFile = await readFilePromise(
                    viewsDir + 'jobnotification.html'
                );
                break;
            case NotificationType.REQUEST_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(
                    viewsDir + 'adminactivation.html'
                );
                break;
            case NotificationType.REQUEST_UNKNOWN_INSTITUTE:
                templateFile = await readFilePromise(
                    viewsDir + 'adminactivationUnknownInst.html'
                );
                break;
            case NotificationType.NOTIFICATION_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(
                    viewsDir + 'adminactivationNotification.html'
                );
                break;
            case NotificationType.NOTIFICATION_NOT_ADMIN_ACTIVATED:
                templateFile = await readFilePromise(
                    viewsDir + 'notAdminactivationNotification.html'
                );
                break;
            case NotificationType.NOTIFICATION_ALREADY_REGISTERED:
                templateFile = await readFilePromise(
                    viewsDir + 'reguserexists.html'
                );
                break;
            case NotificationType.REMINDER_ADMIN_ACTIVATION:
                templateFile = await readFilePromise(
                    viewsDir + 'adminactivationReminder.html'
                );
                break;
            case NotificationType.NOTIFICATION_SENT:
                templateFile = await readFilePromise(
                    viewsDir + 'sentnotification.html'
                );
                break;
            default:
                logger.warn('Unknown notification type', {
                    notification: data.type
                });
        }
        if (templateFile) {
            sendMail(data.payload, templateFile.toString('utf-8'), {
                to: data.meta.email,
                cc: data.meta.cc ? data.meta.cc : [],
                subject: data.title,
                attachments: data.meta.attachments
                    ? data.meta.attachments.map(mapDataFile)
                    : []
            });
        }
    });
}

function mapDataFile(dataset: DatasetFile) {
    return {
        filename: dataset.originalname,
        content: dataset.buffer,
        contentType: dataset.mimetype
    };
}

function sendMail(
    // tslint:disable-next-line
    templateData: any,
    templateFile: string,
    options: MailOptions
) {
    templateData.copyrightYear = new Date().getFullYear();

    let template = handlebars.compile(templateFile);
    let result = template(templateData);

    const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        ...options,
        ...{
            from: fromAddress,
            replyTo: replyToAddress,
            html: result
        }
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.error(
                `Error sending mail. error=${error} mailSubject="${
                    mailOptions.subject
                }"`
            );
        } else {
            logger.info('Email sent', {
                subject: mailOptions.subject
            });
        }
    });
}

export { registerListeners };
