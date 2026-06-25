import { Request } from 'express';
import { expressjwt } from 'express-jwt';

function validateToken(apiRoute: string, secret: string) {
    const whiteList = [
        apiRoute,
        apiRoute + '/',
        apiRoute + '/info',
        apiRoute + '/institutes',
        apiRoute + '/nrls',
        apiRoute + '/client-dashboard-info',
        apiRoute + '/zomo-plan-file',
        apiRoute + '/users/login',
        apiRoute + '/users/registration',
        apiRoute + '/users/reset-password-request',
        // Consent is authenticated inside the controller (JWT or Keycloak
        // session), so it bypasses the blanket expressjwt guard like /orders.
        apiRoute + '/users/consent',
        apiRoute + '/samples/validated',
        apiRoute + '/samples',
        apiRoute + '/orders',
        apiRoute + '/orders/samples-with-results',
        // Keycloak session-based auth routes (no JWT required)
        apiRoute + '/auth/login',
        apiRoute + '/auth/callback',
        apiRoute + '/auth/logout',
        apiRoute + '/auth/me',
        new RegExp(apiRoute + '/users/reset-password'),
        new RegExp(apiRoute + '/users/verification'),
        new RegExp(apiRoute + '/users/activation')
    ];

    return expressjwt({
        secret,
        algorithms: ['HS256'],
        getToken: req => getTokenFromHeader(req) ?? undefined
    }).unless({
        path: whiteList
    });
}

function getTokenFromHeader(req: Request): string | null {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
}

export { getTokenFromHeader, validateToken };
