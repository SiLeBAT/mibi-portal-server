import { NextFunction, Request, Response } from 'express';
import { ActorContextService } from '../../../app/authentication/model/actor.model';
import { logger } from '../../../aspects';
import './session.augment';

export function resolveActorContext(actorContextService: ActorContextService) {
    return async (req: Request, res: Response, next: NextFunction) => {
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
        } catch (error) {
            logger.error(`resolveActorContext error: ${error}`);
        }
        next();
    };
}
