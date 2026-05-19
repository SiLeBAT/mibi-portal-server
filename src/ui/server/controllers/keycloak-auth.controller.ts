import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpGet,
    httpPost,
    request,
    response
} from 'inversify-express-utils';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { KeycloakOidcPort } from '../../../app/authentication/model/oidc.model';
import { logger } from '../../../aspects';
import { KeycloakAuthController } from '../model/controller.model';
import { SERVER_ERROR_CODE } from '../model/enums';
import { AppServerConfiguration } from '../model/server.model';
import { SERVER_TYPES } from '../server.types';
import { AbstractController } from './abstract.controller';
import '../middleware/session.augment';

enum AUTH_ROUTE {
    ROOT = '/auth',
    LOGIN = '/login',
    CALLBACK = '/callback',
    LOGOUT = '/logout',
    ME = '/me'
}

@controller('/v2')
export class DefaultKeycloakAuthController
    extends AbstractController
    implements KeycloakAuthController
{
    constructor(
        @inject(APPLICATION_TYPES.KeycloakOidcService)
        private oidcService: KeycloakOidcPort,
        @inject(SERVER_TYPES.AppServerConfiguration)
        private configuration: AppServerConfiguration
    ) {
        super();
    }

    @httpGet(AUTH_ROUTE.ROOT + AUTH_ROUTE.LOGIN)
    async getLogin(@request() req: Request, @response() res: Response) {
        logger.info(`${this.constructor.name}.getLogin, Request received`);
        try {
            const { authorizationUrl, state, codeVerifier } =
                await this.oidcService.buildAuthorizationUrl();
            req.session.oidcState = state;
            req.session.codeVerifier = codeVerifier;
            res.redirect(authorizationUrl);
        } catch (error) {
            logger.error(`${this.constructor.name}.getLogin error: ${error}`);
            this.fail(res);
        }
    }

    @httpGet(AUTH_ROUTE.ROOT + AUTH_ROUTE.CALLBACK)
    async getCallback(@request() req: Request, @response() res: Response) {
        logger.info(`${this.constructor.name}.getCallback, Request received`);
        try {
            const { code, state, iss } = req.query as {
                code?: string;
                state?: string;
                iss?: string;
            };
            if (!code || !state || state !== req.session.oidcState) {
                this.clientError(res);
                return;
            }
            const codeVerifier = req.session.codeVerifier!;
            const user = await this.oidcService.exchangeCode(
                code,
                state,
                codeVerifier,
                iss
            );
            req.session.oidcState = undefined;
            req.session.codeVerifier = undefined;
            req.session.user = user;
            res.redirect(this.configuration.clientUrl || '/');
        } catch (error) {
            logger.error(
                `${this.constructor.name}.getCallback error: ${error}`
            );
            this.fail(res);
        }
    }

    @httpGet(AUTH_ROUTE.ROOT + AUTH_ROUTE.ME)
    getMe(@request() req: Request, @response() res: Response) {
        if (!req.session?.user) {
            this.unauthorized(res, {
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Not authenticated'
            });
            return;
        }
        this.ok(res, {
            sub: req.session.user.sub,
            email: req.session.user.email,
            preferred_username: req.session.user.preferred_username
        });
    }

    @httpPost(AUTH_ROUTE.ROOT + AUTH_ROUTE.LOGOUT)
    async postLogout(@request() req: Request, @response() res: Response) {
        logger.info(`${this.constructor.name}.postLogout, Request received`);
        try {
            const idToken = req.session.user?.id_token;
            const endSessionUrl = this.oidcService.getEndSessionUrl(idToken);
            await new Promise<void>((resolve, reject) => {
                req.session.destroy(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            this.ok(res, { endSessionUrl });
        } catch (error) {
            logger.error(`${this.constructor.name}.postLogout error: ${error}`);
            this.fail(res);
        }
    }
}
