import * as jwt from 'express-jwt';

function validateToken(secret: string) {
    const whiteList = [
        '/api/v1/util/system-info',
        '/api/v1/institutions',
        '/api/v1/users/login',
        '/api/v1/users/register',
        '/api/v1/users/recovery',
        /\/api\/v1\/users\/reset\/*/,
        /\/api\/v1\/users\/activate\/*/,
        /\/api\/v1\/users\/adminactivate\/*/,
        '/api/v1/validation'
    ];

    return jwt({
        secret,
        getToken: function(req) {
            if (
                req.headers.authorization &&
                req.headers.authorization.split(' ')[0] === 'Bearer'
            ) {
                return req.headers.authorization.split(' ')[1];
            }
            return null;
        }
    }).unless({
        path: whiteList
    });
}

export { validateToken };
