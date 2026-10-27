import { Request, Response } from 'express';
import { UserConsentPort } from '../../../app/authentication/model/consent.model';
import { UserEmailNotificationPort } from '../../../app/authentication/model/email-notification.model';
import { KeycloakOidcPort } from '../../../app/authentication/model/oidc.model';
import { KeycloakAuthController } from '../model/controller.model';
import { SERVER_ERROR_CODE } from '../model/enums';
import { MeResponseDTO } from '../model/response.model';
import { AppServerConfiguration } from '../model/server.model';
import { AbstractController } from './abstract.controller';
import '../middleware/session.augment';

export class DefaultKeycloakAuthController
    extends AbstractController
    implements KeycloakAuthController
{
    constructor(
        private oidcService: KeycloakOidcPort,
        private userConsentService: UserConsentPort,
        private userEmailNotificationService: UserEmailNotificationPort,
        private configuration: AppServerConfiguration
    ) {
        super();
    }

    async getLogin(req: Request, res: Response) {
        await this.handleRequest(res, this.getLogin.name, async () => {
            const { authorizationUrl, state, codeVerifier } =
                await this.oidcService.buildAuthorizationUrl();
            req.session.oidcState = state;
            req.session.codeVerifier = codeVerifier;
            res.redirect(authorizationUrl);
        });
    }

    async getCallback(req: Request, res: Response) {
        await this.handleRequest(res, this.getCallback.name, async () => {
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
        });
    }

    async getMe(req: Request, res: Response) {
        await this.handleRequest(res, this.getMe.name, async () => {
            if (!req.session?.user) {
                this.unauthorized(res, {
                    code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                    message: 'Not authenticated'
                });
                return;
            }
            const consent = await this.userConsentService.getConsentByEmail(
                req.session.user.email
            );
            const emailNotificationSettings =
                await this.userEmailNotificationService.getEmailNotificationSettingsByEmail(
                    req.session.user.email
                );
            const dto: MeResponseDTO = {
                sub: req.session.user.sub,
                email: req.session.user.email,
                preferred_username: req.session.user.preferred_username,
                dataSaveAgreed: consent.dataSaveAgreed,
                dataSaveViewed: consent.dataSaveViewed,
                emailNotificationSettings
            };
            this.ok(res, dto);
        });
    }

    async postLogout(req: Request, res: Response) {
        await this.handleRequest(res, this.postLogout.name, async () => {
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
        });
    }
}
