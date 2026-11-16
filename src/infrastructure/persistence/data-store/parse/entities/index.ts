import { logger } from './../../../../../aspects';
import { registerParseClass as registerInstitution } from './institution.entity';
import { registerParseClass as registerToken } from './reset-token.entity';
import { registerParseClass as registerUser } from './user.entity';

/**
 * +++++++ IMPORTANT +++++++
 * Objects returned from queries should use the entity subclasses of Parse.Object.
 * For that it is necessary to register the subclass.
 * For each new entity subclass add here the registration function that should be defined in each entity subclass.
 *
 * The entities only map existing classes; the class schemas themselves are
 * defined in infrastructure/parse-server/mibi-schema.json.
 */
const REGISTER_FUNCTION_ARRAY: RegisterFunc[] = [
    registerInstitution,
    registerUser,
    registerToken
];

interface RegisterFunc {
    (): void;
}

export function registerEntities(): void {
    logger.info('Registering Parse entities');

    REGISTER_FUNCTION_ARRAY.forEach(registerFunc => {
        registerFunc();
    });
}
