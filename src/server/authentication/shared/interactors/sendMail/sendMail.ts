import * as config from 'config';
import * as readFilePromise from 'fs-readfile-promise';
import { sendMail } from './../../../../../peripherals/mail';
import { IUserEntity, IUserToken } from '../../entities';

// TODO: Clean up this module
const API_URL = config.get('server.apiUrl');
const APP_NAME = config.get('appName');
const SUPPORT_CONTACT = config.get('supportContact');

const viewsDir = __dirname + '/views/de/';

export interface IRecoveryData {
    email: string;
    host: string;
    userAgent: string;
}

async function sendActivationEmail(user: IUserEntity, activationToken: IUserToken, security: IRecoveryData) {

    const templateFile = await readFilePromise(viewsDir + 'regactivation.html');
    const name = user.firstName + ' ' + user.lastName;
    const activationUrl = API_URL + '/users/activate/' + activationToken.token;
    const activationData = {
        'name': name,
        'action_url': activationUrl,
        'operating_system': security.host,
        'user_agent': security.userAgent,
        'support_contact': SUPPORT_CONTACT,
        'appName': APP_NAME
    };

    const subject = `Aktivieren Sie Ihr Konto für ${APP_NAME}`;// `Activate your account for ${APP_NAME}`;
    sendMail(activationData, templateFile.toString('utf-8'), user.email, subject);
}

async function sendResetHelpEmail(security: IRecoveryData) {

    const templateFile = await readFilePromise(viewsDir + 'pwresethelp.html');
    const resetHelpData = {
        'email_address': security.email,
        'operating_system': security.host,
        'user_agent': security.userAgent,
        'support_contact': SUPPORT_CONTACT,
        'action_url': API_URL + '/users/recovery',
        'support_url': API_URL + '/users/recovery',
        'appName': APP_NAME
    };

    const subject = `Setzen Sie Ihr ${APP_NAME}-Konto Passwort zurück.`;// `Reset Password for ${APP_NAME}`;
    sendMail(resetHelpData, templateFile.toString('utf-8'), security.email, subject);
}

async function sendResetEmail(user: IUserEntity, resetToken: IUserToken, security: IRecoveryData) {
    const templateFile = await readFilePromise(viewsDir + 'pwreset.html');
    const name = user.firstName + ' ' + user.lastName;
    const resetUrl = API_URL + '/users/reset/' + resetToken.token;
    const resetData = {
        'name': name,
        'action_url': resetUrl,
        'operating_system': security.host,
        'user_agent': security.userAgent,
        'support_contact': SUPPORT_CONTACT,
        'appName': APP_NAME
    };

    const subject = `Setzen Sie Ihr ${APP_NAME}-Konto Passwort zurück.`;// `Reset Password for ${APP_NAME}`;
    sendMail(resetData, templateFile.toString('utf-8'), user.email, subject);
}

async function sendNotificationEmail(user: IUserEntity) {
    const templateFile = await readFilePromise(viewsDir + 'pwnotification.html');
    const name = user.firstName + ' ' + user.lastName;
    const notificationData = {
        'name': name,
        'email': user.email,
        'action_url': API_URL + '/users/login',
        'appName': APP_NAME
    };
    const subject = `Passwort für ${APP_NAME}-Konto erfolgreich zurückgesetzt.`;// `Reset Password for ${APP_NAME} successful`;
    sendMail(notificationData, templateFile.toString('utf-8'), user.email, subject);
}
export {
    sendActivationEmail,
    sendResetHelpEmail,
    sendResetEmail,
    sendNotificationEmail
};
