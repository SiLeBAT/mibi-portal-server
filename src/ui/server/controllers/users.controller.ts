import { Request, Response } from 'express';
import { inject } from 'inversify';
import {
    controller,
    httpPatch,
    httpPost,
    httpPut,
    request,
    requestParam,
    response
} from 'inversify-express-utils';
import { JsonWebTokenError } from 'jsonwebtoken';
import Parse from 'parse/node';
import {
    AuthorizationError,
    LoginPort,
    LoginResponse,
    PasswordPort,
    RegistrationPort,
    UserLoginInformation,
    UserRegistration
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { UsersController } from '../model/controller.model';
import { MalformedRequestError } from '../model/domain.error';
import { API_ROUTE, SERVER_ERROR_CODE } from '../model/enums';
import {
    NewPasswordRequestDTO,
    RegistrationDetailsDTO,
    ResetRequestDTO
} from '../model/request.model';
import {
    ActivationResponseDTO,
    FailedLoginErrorDTO,
    PasswordResetRequestResponseDTO,
    PasswordResetResponseDTO,
    RegistrationRequestResponseDTO,
    TokenizedUserDTO
} from '../model/response.model';
import { APPLICATION_TYPES } from './../../../app/application.types';
import { AbstractController } from './abstract.controller';

enum USERS_ROUTE {
    ROOT = '/users',
    RESET_PASSWORD_REQUEST = '/reset-password-request',
    RESET_PASSWORD = '/reset-password',
    LOGIN = '/login',
    VERIFICATION = '/verification',
    ACTIVATION = '/activation',
    REGISTRATION = '/registration'
}
@controller(API_ROUTE.V2 + USERS_ROUTE.ROOT)
export class DefaultUsersController
    extends AbstractController
    implements UsersController {
    constructor(
        @inject(APPLICATION_TYPES.PasswordService)
        private passwordService: PasswordPort,
        @inject(APPLICATION_TYPES.LoginService) private loginService: LoginPort,
        @inject(APPLICATION_TYPES.RegistrationService)
        private registrationService: RegistrationPort
    ) {
        super();
    }
    @httpPut(USERS_ROUTE.RESET_PASSWORD_REQUEST)
    async putResetPasswordRequest(
        @request() req: Request,
        @response() res: Response
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
    @httpPatch(USERS_ROUTE.RESET_PASSWORD + '/:token')
    async patchResetPassword(
        @requestParam('token') token: string,
        @request() req: Request,
        @response() res: Response
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
                newPasswordRequest.legacySystem,
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
    @httpPost(USERS_ROUTE.LOGIN)
    async postLogin(@request() req: Request, @response() res: Response) {
        logger.info(
            `${this.constructor.name}.${this.postLogin.name}, Request received`
        );
        try {
            const userLoginInfo: UserLoginInformation =
                this.mapRequestDTOToUserLoginInfo(req);
            const response: LoginResponse = await this.loginService.loginUser(
                userLoginInfo
            );

            const dto: TokenizedUserDTO =
                this.fromLoginResponseToResponseDTO(response);
            logger.info(
                `${this.constructor.name}.${this.postLogin.name}, Response sent`
            );

            try {
                await Parse.User.signUp(userLoginInfo.email, userLoginInfo.password, {
                    email: userLoginInfo.email
                });

            }
            catch (error) {
                logger.error(error)
            }
            finally {
                this.ok(res, dto);
            }

        } catch (error) {
            logger.info(
                `${this.constructor.name}.${this.postLogin.name} has thrown an error. ${error}`
            );
            this.handleError(res, error);
        }
    }

    @httpPatch(USERS_ROUTE.VERIFICATION + '/:token')
    async patchVerification(
        @requestParam('token') token: string,
        @response() res: Response
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
    @httpPatch(USERS_ROUTE.ACTIVATION + '/:token')
    async patchActivation(
        @requestParam('token') token: string,
        @response() res: Response
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
    @httpPost(USERS_ROUTE.REGISTRATION)
    async postRegistration(@request() req: Request, @response() res: Response) {
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
        logger.debug(JSON.stringify(registrationDetail));
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
                userAgent: registrationDetail.legacySystem ? registrationDetail.userAgent || "unknown" : req.headers['user-agent'] as string,
                host: registrationDetail.legacySystem ? registrationDetail.host || "unknown" : req.headers['host'] as string
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
        response: LoginResponse
    ): TokenizedUserDTO {
        return {
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            email: response.user.email,
            token: response.token,
            instituteId: response.user.institution.uniqueId
        };
    }
}
