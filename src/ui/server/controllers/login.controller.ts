import { Request, Response } from 'express';
import {
    IController,
    LoginPort,
    LoginResponse,
    UserLoginInformation
} from '../../../app/ports';
import { logger } from '../../../aspects';

export interface ILoginController extends IController {
    login(req: Request, res: Response): Promise<void>;
}

interface LoginResponseDTO {
    status: string;
    user: UserDTO | null;
}

interface UserDTO {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
    instituteId: string;
}

class LoginController implements ILoginController {
    constructor(private loginService: LoginPort) {}
    async login(req: Request, res: Response) {
        let response: LoginResponse;
        const userLoginInfo: UserLoginInformation = this.mapRequestDTOToUserLoginInfo(
            req
        );
        logger.info('LoginController.login, Request received');
        try {
            response = await this.loginService.loginUser(userLoginInfo);
            const dto = this.fromLoginResponseToResponseDTO(response);
            logger.info('LoginController.login, Response sent');
            res.status(200).json(dto);
        } catch (err) {
            logger.error(`Login failed. error=${err}`);
            res.status(401).json({
                error: 'Unauthorized'
            });
        }
        return res.end();
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
    ): LoginResponseDTO {
        if (response.timeToWait) {
            return {
                status: `Zu viele fehlgeschlagene Logins, bitte warten Sie ${
                    response.timeToWait
                }.`,
                user: null
            };
        }

        return {
            status: 'Anmeldung erfolgreich',
            user: {
                _id: response.user.uniqueId,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                email: response.user.email,
                token: response.token,
                instituteId: response.user.institution.uniqueId
            }
        };
    }
}

export function createController(service: LoginPort) {
    return new LoginController(service);
}
