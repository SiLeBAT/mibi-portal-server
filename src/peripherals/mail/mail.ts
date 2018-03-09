// core

// npm
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as config from 'config';

// local
import { logger } from './../../aspects';

interface IMailConfig {
    replyToAddress: string;
    fromAddress: string;
}

const mailConfig: IMailConfig = config.get('mail');

const fromAddress = mailConfig.fromAddress;
const replyToAddress = mailConfig.replyToAddress;
const host = 'localhost';
const port = 25;

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
            logger.error('error sending mail: ', error);
        } else {
            logger.info('Email sent: ', info.response);
        }
    });

}

export {
    sendMail
};
