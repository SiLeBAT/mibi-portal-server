import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import * as Parse from 'parse/node';
import {
    AuthorizationError,
    EmailNotificationSettings,
    LoginPort,
    LoginResponse,
    PasswordPort,
    RegistrationPort,
    TokenPayload,
    TokenPort,
    UserConsent,
    UserConsentPort,
    UserEmailNotificationPort,
    UserLoginInformation,
    UserPort,
    UserRegistration
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { UsersController } from '../model/controller.model';
import { MalformedRequestError } from '../model/domain.error';
import { SERVER_ERROR_CODE } from '../model/enums';
import { getTokenFromHeader } from '../middleware/token-validator.middleware';
import {
    NewPasswordRequestDTO,
    RegistrationDetailsDTO,
    ResetRequestDTO,
    UserConsentRequestDTO,
    UserEmailNotificationRequestDTO
} from '../model/request.model';
import {
    ActivationResponseDTO,
    FailedLoginErrorDTO,
    PasswordResetRequestResponseDTO,
    PasswordResetResponseDTO,
    RegistrationRequestResponseDTO,
    TokenizedUserDTO,
    UserConsentResponseDTO,
    UserEmailNotificationResponseDTO
} from '../model/response.model';
import { AppServerConfiguration } from '../ports';
import { AbstractController, ParseSingleResponse } from './abstract.controller';
import '../middleware/session.augment';

export class DefaultUsersController
    extends AbstractController
    implements UsersController
{
    private redirectionTarget: AxiosInstance;
    constructor(
        private passwordService: PasswordPort,
        private loginService: LoginPort,
        private registrationService: RegistrationPort,
        private tokenService: TokenPort,
        private userService: UserPort,
        private userConsentService: UserConsentPort,
        private userEmailNotificationService: UserEmailNotificationPort,
        configuration: AppServerConfiguration
    ) {
        super();
        this.redirectionTarget = axios.create({
            baseURL: configuration.parseAPI,
            headers: { 'X-Parse-Application-Id': configuration.appId }
        });
    }
    async putResetPasswordRequest(
        req: Request,
        res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.putResetPasswordRequest.name}, Request received`
        );
        try {
            const resetRequest: ResetRequestDTO = req.body;
            if (!resetRequest.email) {
                throw new MalformedRequestError(
                    'Email for password reset not supplied'
                );
            }
            await this.passwordService.requestPasswordReset({
                email: resetRequest.email,
                host: req.headers['host'] as string,
                userAgent: req.headers['user-agent'] as string,
                legacySystem: resetRequest.legacySystem
            });
            const dto: PasswordResetRequestResponseDTO = {
                passwordResetRequest: true,
                email: resetRequest.email
            };
            logger.info(
                `${this.constructor.name}.${this.putResetPasswordRequest.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.putResetPasswordRequest.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    async patchResetPassword(
        token: string,
        req: Request,
        res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchResetPassword.name}, Request received`
        );
        try {
            const newPasswordRequest: NewPasswordRequestDTO = req.body;
            if (!newPasswordRequest.password) {
                throw new MalformedRequestError(
                    'New password or token not supplied'
                );
            }
            await this.passwordService.resetPassword(
                token,
                newPasswordRequest.password,
                newPasswordRequest.legacySystem
            );
            const dto: PasswordResetResponseDTO = {
                passwordReset: true
            };
            logger.info(
                `${this.constructor.name}.${this.patchResetPassword.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchResetPassword.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    async postLogin(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postLogin.name}, Request received`
        );
        try {
            const userLoginInfo: UserLoginInformation =
                this.mapRequestDTOToUserLoginInfo(req);
            const response: LoginResponse = await this.loginService.loginUser(
                userLoginInfo
            );

            const consent: UserConsent =
                await this.userConsentService.getConsentByEmail(
                    response.user.email
                );

            const emailNotificationSettings: EmailNotificationSettings =
                await this.userEmailNotificationService.getEmailNotificationSettingsByEmail(
                    response.user.email
                );

            const dto: TokenizedUserDTO = this.fromLoginResponseToResponseDTO(
                response,
                consent,
                emailNotificationSettings
            );
            logger.info(
                `${this.constructor.name}.${this.postLogin.name}, Response sent`
            );

            try {
                await Parse.User.signUp(
                    userLoginInfo.email,
                    userLoginInfo.password,
                    {
                        email: userLoginInfo.email
                    }
                );
            } catch (error) {
                logger.error(error);
            } finally {
                this.ok(res, dto);
            }
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postLogin.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    async patchVerification(
        token: string,
        res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchVerification.name}, Request received`
        );
        try {
            const username = await this.registrationService.verifyUser(token);
            const dto: ActivationResponseDTO = {
                activation: true,
                username
            };
            logger.info(
                `${this.constructor.name}.${this.patchVerification.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchVerification.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    async patchActivation(
        token: string,
        res: Response
    ) {
        logger.info(
            `${this.constructor.name}.${this.patchActivation.name}, Request received`
        );
        try {
            const username = await this.registrationService.activateUser(token);
            const dto: ActivationResponseDTO = {
                activation: true,
                username
            };
            logger.info(
                `${this.constructor.name}.${this.patchActivation.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchActivation.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async postRegistration(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postRegistration.name}, Request received`
        );
        try {
            const credentials: UserRegistration =
                this.fromRequestToUserRegistration(req);
            await this.registrationService.registerUser(credentials);
            const dto: RegistrationRequestResponseDTO = {
                registerRequest: true,
                email: credentials.email
            };

            logger.info(
                `${this.constructor.name}.${this.postRegistration.name}, Response sent`
            );

            await this.redirectionTarget.post<
                ParseSingleResponse<unknown>,
                AxiosResponse<ParseSingleResponse<unknown>>,
                {
                    username: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                    password: string;
                    institution: string;
                }
            >('users', {
                username: credentials.email,
                password: credentials.password,
                email: credentials.email,
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                institution: credentials.institution
            });
            return this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postRegistration.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private handleError(res: Response, error: Error) {
        if (error instanceof MalformedRequestError) {
            this.clientError(res);
        } else if (error instanceof JsonWebTokenError) {
            const dto = {
                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                message: 'Unauthorized request'
            };
            this.unauthorized(res, dto);
        } else if (error instanceof AuthorizationError) {
            let dto: FailedLoginErrorDTO = {
                code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                message: 'Authentication failure'
            };
            if (error.timeToWait) {
                dto = {
                    code: SERVER_ERROR_CODE.AUTHENTICATION_ERROR,
                    message: 'Too many failed login attempts',
                    waitTime: error.timeToWait
                };
            }
            this.unauthorized(res, dto);
        } else {
            this.fail(res);
        }
    }

    private fromRequestToUserRegistration(req: Request): UserRegistration {
        const registrationDetail: RegistrationDetailsDTO = req.body;
        try {
            if (
                !(
                    registrationDetail.firstName &&
                    registrationDetail.lastName &&
                    registrationDetail.email &&
                    registrationDetail.password &&
                    registrationDetail.instituteId
                )
            ) {
                throw new MalformedRequestError(
                    'Registration details missing.'
                );
            }
            const credentials = {
                firstName: registrationDetail.firstName,
                lastName: registrationDetail.lastName,
                email: registrationDetail.email,
                password: registrationDetail.password,
                institution: registrationDetail.instituteId,
                userAgent: registrationDetail.legacySystem
                    ? registrationDetail.userAgent || 'unknown'
                    : (req.headers['user-agent'] as string),
                host: registrationDetail.legacySystem
                    ? registrationDetail.host || 'unknown'
                    : (req.headers['host'] as string)
            };
            return credentials;
        } catch (error) {
            logger.error(
                `${this.constructor.name}.${this.fromRequestToUserRegistration.name}, unable to verify credentials during registration. error=${error}`
            );
            throw new MalformedRequestError('Registration details invalid');
        }
    }

    private mapRequestDTOToUserLoginInfo(req: Request) {
        return {
            email: req.body.email,
            password: req.body.password,
            userAgent: req.headers['user-agent'],
            host: req.headers['host']
        };
    }
    private fromLoginResponseToResponseDTO(
        response: LoginResponse,
        consent: UserConsent,
        emailNotificationSettings: EmailNotificationSettings
    ): TokenizedUserDTO {
        return {
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            token: response.token,
            instituteId: response.user.institution.uniqueId,
            dataSaveAgreed: consent.dataSaveAgreed,
            dataSaveViewed: consent.dataSaveViewed,
            emailNotificationSettings
        };
    }

    async patchConsent(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.patchConsent.name}, Request received`
        );
        try {
            const email = await this.resolveAuthenticatedEmail(req);
            if (!email) {
                this.unauthorized(res, {
                    code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                    message: 'Not authenticated'
                });
                return;
            }
            const consentRequest: UserConsentRequestDTO = req.body;
            if (typeof consentRequest.dataSaveAgreed !== 'boolean') {
                throw new MalformedRequestError(
                    'Consent choice (dataSaveAgreed) not supplied'
                );
            }
            const consent: UserConsent =
                await this.userConsentService.saveConsentByEmail(
                    email,
                    consentRequest.dataSaveAgreed
                );
            const dto: UserConsentResponseDTO = {
                dataSaveAgreed: consent.dataSaveAgreed,
                dataSaveViewed: consent.dataSaveViewed
            };
            logger.info(
                `${this.constructor.name}.${this.patchConsent.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchConsent.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    async patchEmailNotificationSettings(req: Request, res: Response) {
        logger.info(
            `${this.constructor.name}.${this.patchEmailNotificationSettings.name}, Request received`
        );
        try {
            const email = await this.resolveAuthenticatedEmail(req);
            if (!email) {
                this.unauthorized(res, {
                    code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                    message: 'Not authenticated'
                });
                return;
            }
            const settings = this.parseEmailNotificationRequest(req.body);
            const saved =
                await this.userEmailNotificationService.saveEmailNotificationSettingsByEmail(
                    email,
                    settings
                );
            const dto: UserEmailNotificationResponseDTO = saved;
            logger.info(
                `${this.constructor.name}.${this.patchEmailNotificationSettings.name}, Response sent`
            );
            this.ok(res, dto);
        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.patchEmailNotificationSettings.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    private parseEmailNotificationRequest(
        body: UserEmailNotificationRequestDTO
    ): EmailNotificationSettings {
        const FREQUENCIES = ['daily', 'weekly', 'monthly'];
        const WEEKDAYS = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday'
        ];
        const WEEKS_OF_MONTH = ['1', '2', '3', '4', 'last'];

        if (
            !body ||
            typeof body.enabled !== 'boolean' ||
            !FREQUENCIES.includes(body.frequency) ||
            !WEEKDAYS.includes(body.weekday) ||
            !WEEKS_OF_MONTH.includes(body.weekOfMonth)
        ) {
            throw new MalformedRequestError(
                'Invalid email notification settings supplied'
            );
        }
        return {
            enabled: body.enabled,
            frequency: body.frequency,
            weekday: body.weekday,
            weekOfMonth: body.weekOfMonth
        };
    }

    // Resolves the acting user's email in an auth-mode-agnostic way: a Keycloak
    // BFF session carries the user directly, the legacy flow carries a JWT.
    private async resolveAuthenticatedEmail(
        req: Request
    ): Promise<string | undefined> {
        const sessionEmail = req.session?.user?.email;
        if (sessionEmail) {
            return sessionEmail;
        }
        const token = getTokenFromHeader(req);
        if (!token) {
            return undefined;
        }
        const payload: TokenPayload = this.tokenService.verifyToken(token);
        const user = await this.userService.getUserById(payload.sub);
        return user.email;
    }
}
