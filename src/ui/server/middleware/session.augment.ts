import { Actor } from '../../../app/authentication/model/actor.model';
import { OidcUser } from '../../../app/authentication/model/oidc.model';

declare module 'express-session' {
    interface SessionData {
        oidcState?: string;
        codeVerifier?: string;
        user?: OidcUser;
        actor?: Actor;
    }
}

declare module 'express' {
    interface Request {
        currentActor?: Actor;
    }
}
