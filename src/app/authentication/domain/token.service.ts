
import * as config from 'config';
import { sign, verify } from 'jsonwebtoken';
import { ApplicationDomainError } from '../../sharedKernel';

const EXPIRATION_TIME = 60 * 60 * 24;
const ADMIN_EXPIRATION_TIME = 60 * 60 * 24 * 7;
const JWT_SECRET: string = config.get('server.jwtSecret');

function generateToken(id: string) {
    return sign(
        { sub: id },
        JWT_SECRET,
        { expiresIn: EXPIRATION_TIME }
    );
}

function generateAdminToken(id: string) {
    return sign(
        {
            sub: id,
            admin: true
        },
        JWT_SECRET,
        { expiresIn: ADMIN_EXPIRATION_TIME }
    );
}

function verifyToken(token: string, id: string) {
    try {
        const payload = verify(token, JWT_SECRET, { subject: id });
        return payload;
    } catch (error) {
        throw new ApplicationDomainError(`Unable to verify Token. error=${error}`);
    }
}

export {
    generateToken,
    generateAdminToken,
    verifyToken
};