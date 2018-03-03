import * as config from 'config';
import { sendMail } from './../../../../../peripherals/mail';

// TODO: Clean up this module
const API_URL = config.get('server.apiUrl');

function sendActivationEmail(user, activationToken, userAgent, templateFile) {
    const name = user.firstName + ' ' + user.lastName;
    const activationUrl = API_URL + "/users/activate/" + activationToken.token;

    const activationData = {
        "name": name,
        "action_url": activationUrl,
        "operating_system": userAgent
    };

    const subject = 'Activate your account for Epi-Lab';
    sendMail(activationData, templateFile, user.email, subject);
}

function sendResetHelpEmail(email, host, userAgent, templateFile) {
    const resetHelpData = {
        "email_address": email,
        "operating_system": host,
        "browser_name": userAgent,
        "action_url": API_URL + "/users/recovery",
        "support_url": API_URL + "/users/recovery"
    };

    const subject = 'Reset Password for Epi-Lab';
    sendMail(resetHelpData, templateFile, email, subject);
}

function sendResetEmail(user, resetToken, userAgent, templateFile) {
    const name = user.firstName + ' ' + user.lastName;
    const resetUrl = API_URL + "/users/reset/" + resetToken.token;

    const resetData = {
        "name": name,
        "action_url": resetUrl,
        "operating_system": userAgent
    };


    const subject = 'Reset Password for Epi-Lab';
    sendMail(resetData, templateFile, user.email, subject);
}

function sendNotificationEmail(user, templateFile) {
    const name = user.firstName + ' ' + user.lastName;

    const notificationData = {
        "name": name,
        "email": user.email,
        "action_url": process.env.API_URL + "/users/login"
    };


    const subject = 'Reset Password for Epi-Lab Successful';
    sendMail(notificationData, templateFile, user.email, subject);
}
export {
    sendActivationEmail,
    sendResetHelpEmail,
    sendResetEmail,
    sendNotificationEmail
}