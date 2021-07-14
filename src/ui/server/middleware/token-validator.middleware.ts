import jwt from 'express-jwt';

function validateToken(apiRoute: string, secret: string) {
    const whiteList = [
        apiRoute,
        apiRoute + '/',
        apiRoute + '/info',
        apiRoute + '/institutes',
        apiRoute + '/nrls',
        apiRoute + '/users/login',
        apiRoute + '/users/registration',
        apiRoute + '/users/reset-password-request',
        apiRoute + '/samples/validated',
        apiRoute + '/samples',
        new RegExp(apiRoute + '/users/reset-password'),
        new RegExp(apiRoute + '/users/verification'),
        new RegExp(apiRoute + '/users/activation')
    ];

    return jwt({
        secret,
        algorithms: ['HS256'],
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
