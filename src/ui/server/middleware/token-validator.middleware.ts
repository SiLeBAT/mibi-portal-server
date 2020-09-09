import jwt from 'express-jwt';
import { API_ROUTE } from '../model/enums';

function validateToken(secret: string) {
    const whiteList = [
        '/api-docs' + API_ROUTE.V2,
        API_ROUTE.V2,
        API_ROUTE.V2 + '/',
        API_ROUTE.V2 + '/info',
        API_ROUTE.V2 + '/institutes',
        API_ROUTE.V2 + '/nrls',
        API_ROUTE.V2 + '/users/login',
        API_ROUTE.V2 + '/users/registration',
        API_ROUTE.V2 + '/users/reset-password-request',
        API_ROUTE.V2 + '/samples/validated',
        API_ROUTE.V2 + '/samples',
        new RegExp(API_ROUTE.V2 + '/users/reset-password'),
        new RegExp(API_ROUTE.V2 + '/users/verification'),
        new RegExp(API_ROUTE.V2 + '/users/activation')
    ];

    return jwt({
        secret,
        getToken: getTokenFromHeader
    }).unless({
        path: whiteList
    });
}

// tslint:disable-next-line: no-any
function getTokenFromHeader(req: any): string | null {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

export { validateToken, getTokenFromHeader };
