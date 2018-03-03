import * as jwt from 'jsonwebtoken';
import * as config from 'config';

const EXPIRATION_TIME = 60 * 60 * 12;
const JWT_SECRET = config.get('server.jwtSecret');
function generateToken(id) {
    return jwt.sign(
        { sub: id },
        JWT_SECRET,
        { expiresIn: EXPIRATION_TIME }
    )
}

function verifyToken(token, id) {
    return jwt.verify(token, JWT_SECRET, { subject: id });
}

export {
    verifyToken,
    generateToken
}