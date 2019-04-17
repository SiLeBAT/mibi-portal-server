import { sign, verify } from 'jsonwebtoken';
import { getConfigurationService } from './../../core/application/configuration.service';
import { ApplicationDomainError } from '../../core/domain/domain.error';

const EXPIRATION_TIME = 60 * 60 * 24;
const ADMIN_EXPIRATION_TIME = 60 * 60 * 24 * 7;

const serverConfig = getConfigurationService().getServerConfiguration();

const JWT_SECRET: string = serverConfig.jwtSecret;

function generateToken(id: string) {
    return sign({ sub: id }, JWT_SECRET, { expiresIn: EXPIRATION_TIME });
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
        throw new ApplicationDomainError(
            `Unable to verify Token. error=${error}`
        );
    }
}

export { generateToken, generateAdminToken, verifyToken };
