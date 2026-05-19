import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ActorContextService } from '../../../app/authentication/model/actor.model';
import { logger } from '../../../aspects';
import './session.augment';

export function resolveActorContext(
    actorContextService: ActorContextService
): RequestHandler {
    const handler = async (req: Request, res: Response, next: NextFunction) => {
        // Auth endpoints must remain reachable even when actor resolution fails,
        // otherwise a bad session permanently locks the user out — login and
        // logout would both 500 before their controllers run.
        if (req.path?.startsWith('/v2/auth/')) {
            next();
            return;
        }
        const oidcUser = req.session?.user;
        if (!oidcUser) {
            next();
            return;
        }
        try {
            const actor = await actorContextService.resolveActor(
                oidcUser.sub,
                oidcUser.email,
                oidcUser.preferred_username,
                oidcUser.groups,
                req.session.actor
            );
            req.session.actor = actor;
            req.currentActor = actor;
            next();
        } catch (error) {
            logger.warn(`resolveActorContext error: ${error}`);
            res.status(500).json({
                code: 2,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to resolve actor context'
            });
        }
    };
    // Wrap in a sync handler so Express sees a void-returning RequestHandler
    // and any unhandled rejection surfaces through next(err) instead of
    // becoming an unhandled promise.
    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
