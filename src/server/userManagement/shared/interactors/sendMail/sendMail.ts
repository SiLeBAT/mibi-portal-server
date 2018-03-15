import * as config from 'config';
import { sendMail } from './../../../../../peripherals/mail';
import { IUserEntity, IUserToken } from '../../entities';

// TODO: Clean up this module
const API_URL = config.get('server.apiUrl');
const APP_NAME = config.get('appName');

function sendActivationEmail(user: IUserEntity, activationToken: IUserToken, userAgent: string, templateFile: string) {
    const name = user.firstName + ' ' + user.lastName;
    const activationUrl = API_URL + '/users/activate/' + activationToken.token;
    const activationData = {
        'name': name,
        'action_url': activationUrl,
        'operating_system': userAgent,
        'appName': APP_NAME
    };

    const subject = `Activate your account for ${APP_NAME}`;
    sendMail(activationData, templateFile, user.email, subject);
}

function sendResetHelpEmail(email: string, host: string, userAgent: string, templateFile: string) {
    const resetHelpData = {
        'email_address': email,
        'operating_system': host,
        'browser_name': userAgent,
        'action_url': API_URL + '/users/recovery',
        'support_url': API_URL + '/users/recovery',
        'appName': APP_NAME
    };

    const subject = `Reset Password for ${APP_NAME}`;
    sendMail(resetHelpData, templateFile, email, subject);
}

function sendResetEmail(user: IUserEntity, resetToken: IUserToken, userAgent: string, templateFile: string) {
    const name = user.firstName + ' ' + user.lastName;
    const resetUrl = API_URL + '/users/reset/' + resetToken.token;
    const resetData = {
        'name': name,
        'action_url': resetUrl,
        'operating_system': userAgent,
        'appName': APP_NAME
    };

    const subject = `Reset Password for ${APP_NAME}`;
    sendMail(resetData, templateFile, user.email, subject);
}

function sendNotificationEmail(user: IUserEntity, templateFile: string) {
    const name = user.firstName + ' ' + user.lastName;
    const notificationData = {
        'name': name,
        'email': user.email,
        'action_url': API_URL + '/users/login',
        'appName': APP_NAME
    };

    const subject = `Reset Password for ${APP_NAME} successful`;
    sendMail(notificationData, templateFile, user.email, subject);
}
export {
    sendActivationEmail,
    sendResetHelpEmail,
    sendResetEmail,
    sendNotificationEmail
};
