// core

// npm
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as config from 'config';
import * as readFilePromise from 'fs-readfile-promise';

// local
import { logger } from './../../aspects';
import { INotificationPort, NotificationType, INotification } from '../../app/ports';

interface IMailConfig {
    replyToAddress: string;
    fromAddress: string;
}

const mailConfig: IMailConfig = config.get('mail');

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

const viewsDir = __dirname + '/views/de/';

function registerListeners(notificationService: INotificationPort) {
    notificationService.addHandler(async (data: INotification) => {
        let templateFile;
        switch (data.type) {
            case NotificationType.RESET_SUCCESS:
                templateFile = await readFilePromise(viewsDir + 'pwnotification.html');
                break;
            case NotificationType.REQUEST_ACTIVATION:
                templateFile = await readFilePromise(viewsDir + 'regactivation.html');
                break;
            case NotificationType.REQUEST_ALTERNATIVE_CONTACT:
                templateFile = await readFilePromise(viewsDir + 'pwresethelp.html');
                break;
            case NotificationType.REQUEST_RESET:
                templateFile = await readFilePromise(viewsDir + 'pwreset.html');
                break;
            default:
                logger.warn('Unknow notification type', { notification: data });
        }
        if (templateFile) {
            sendMail(data.payload, templateFile.toString('utf-8'), data.meta.email, data.title);
        }
    });
}

// tslint:disable-next-line
function sendMail(templateData: any, templateFile: string, toAddress: string, subject: string) {
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
        from: fromAddress,
        replyTo: replyToAddress,
        to: toAddress,
        subject: subject,
        html: result
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            logger.error('error sending mail', { error: error });
        } else {
            logger.info('Email sent', { response: info.response });
        }
    });

}

export {
    registerListeners
};
