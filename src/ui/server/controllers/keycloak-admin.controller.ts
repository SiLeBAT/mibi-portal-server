import { Request, Response } from 'express';
import { KeycloakActorsPort } from '../../../app/authentication/model/keycloak-actors.model';
import { logger } from '../../../aspects';
import { KeycloakAdminController } from '../model/controller.model';
import { AbstractController } from './abstract.controller';
import '../middleware/session.augment';

const MIBI_ADMIN_ROLE = 'mibi-admin';

export class DefaultKeycloakAdminController
    extends AbstractController
    implements KeycloakAdminController
{
    constructor(private actorsService: KeycloakActorsPort) {
        super();
    }

    async getPendingActors(req: Request, res: Response) {
        if (!this.isMibiAdmin(req)) {
            this.forbidden(res);
            return;
        }
        try {
            const actors = await this.actorsService.listPendingActors();
            this.ok(res, actors);
        } catch (error) {
            logger.error(
                `${this.constructor.name}.getPendingActors error: ${error}`
            );
            this.fail(res);
        }
    }

    async postEnableActor(req: Request, res: Response) {
        if (!this.isMibiAdmin(req)) {
            this.forbidden(res);
            return;
        }
        const sub = String(req.params.sub);
        try {
            await this.actorsService.activateActor(sub);
            logger.info(`admin=${req.session.user!.sub} enabled actor=${sub}`);
            this.ok(res);
        } catch (error) {
            logger.error(
                `${this.constructor.name}.postEnableActor error: ${error}`
            );
            this.fail(res);
        }
    }

    async postDisableActor(req: Request, res: Response) {
        if (!this.isMibiAdmin(req)) {
            this.forbidden(res);
            return;
        }
        const sub = String(req.params.sub);
        try {
            await this.actorsService.disableActor(sub);
            logger.info(`admin=${req.session.user!.sub} disabled actor=${sub}`);
            this.ok(res);
        } catch (error) {
            logger.error(
                `${this.constructor.name}.postDisableActor error: ${error}`
            );
            this.fail(res);
        }
    }

    private isMibiAdmin(req: Request): boolean {
        return req.session.user?.roles?.includes(MIBI_ADMIN_ROLE) ?? false;
    }
}
