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
        await this.handleRequest(res, this.getPendingActors.name, async () => {
            if (!this.isMibiAdmin(req)) {
                this.forbidden(res);
                return;
            }
            const actors = await this.actorsService.listPendingActors();
            this.ok(res, actors);
        });
    }

    async postEnableActor(req: Request, res: Response) {
        await this.handleRequest(res, this.postEnableActor.name, async () => {
            if (!this.isMibiAdmin(req)) {
                this.forbidden(res);
                return;
            }
            const sub = String(req.params.sub);
            await this.actorsService.activateActor(sub);
            logger.info(`admin=${req.session.user!.sub} enabled actor=${sub}`);
            this.ok(res);
        });
    }

    async postDisableActor(req: Request, res: Response) {
        await this.handleRequest(res, this.postDisableActor.name, async () => {
            if (!this.isMibiAdmin(req)) {
                this.forbidden(res);
                return;
            }
            const sub = String(req.params.sub);
            await this.actorsService.disableActor(sub);
            logger.info(`admin=${req.session.user!.sub} disabled actor=${sub}`);
            this.ok(res);
        });
    }

    private isMibiAdmin(req: Request): boolean {
        return req.session.user?.roles?.includes(MIBI_ADMIN_ROLE) ?? false;
    }
}
