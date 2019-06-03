import * as jwt from 'express-jwt';

function validateToken(secret: string) {
    const whiteList = [
        /\/users\/activate\/*/,
        /\/users\/adminactivate\/*/,
        /\/users\/reset\/*/,
        '/v1/info',
        '/v1/institutes',
        '/v1/users/login',
        '/v1/users/registration',
        '/v1/users/reset-password-request',
        /\/v1\/users\/reset-password\/*/,
        /\/v1\/users\/verification\/*/,
        /\/v1\/users\/activation\/*/,
        '/v1/samples/validated',
        '/v1/samples',
        '/api-docs/v1',
        '/v1',
        '/v1/'
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
