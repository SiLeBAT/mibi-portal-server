import * as jwt from 'express-jwt';

function validateToken(secret: string) {
    const whiteList = [
        '/index.html',
        { url: '/', methods: ['GET'] },
        /\/public\/*/,
        /assets\/*/,
        /\/*.ico/,
        /\/*.js/,
        '/api/v1/institutions',
        '/users/login',
        '/users/register',
        '/users/recovery',
        /\/users\/reset\/*/,
        /\/users\/activate\/*/,
        // FIXME: temporary
        '/api/v1/upload',
        '/api/v1/validation'
    ];

    return jwt({
        secret,
        getToken: function (req) {
            if (req.headers.authorization && (<string>req.headers.authorization).split(' ')[0] === 'Bearer') {
                return (<string>req.headers.authorization).split(' ')[1];
            }
            return null;
        }
    }).unless({
        path: whiteList
    })
}

export {
    validateToken
}