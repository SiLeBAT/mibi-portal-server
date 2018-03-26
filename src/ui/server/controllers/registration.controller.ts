import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IController, IRegistrationPort } from '../../../app/ports';

export interface IRegistrationController extends IController {
    register(req: Request, res: Response): void;
    activate(req: Request, res: Response): Promise<void>;
}

class RegistrationController implements IRegistrationController {

    constructor(private registrationService: IRegistrationPort) { }

    async activate(req: Request, res: Response) {
        let dto;
        try {
            await this.registrationService.activateUser(req.params.token);
            dto = {
                title: 'Account Activation successful!'
            };
            res.status(200);
        } catch (err) {
            logger.error('Unable to activate user', { error: err });
            dto = {};
            res.status(400);
        }
        logger.info('Response sent', dto);
        return res.json(dto).end();
    }

    async register(req: Request, res: Response) {

        const credentials = this.fromRequestToCredentials(req);
        logger.info('Request received', credentials);
        let dto;
        try {
            await this.registrationService.registerUser(credentials);
            dto = {
                title: `Please activate your account: An email has been sent to ${credentials.email} with further instructions`
            };
            res.status(200);

        } catch (err) {
            logger.error(`Unable to register user. error=${err}`);
            dto = {};
            return res
                .status(500);
        }
        logger.info('Response sent', dto);
        return res.json(dto).end();
    }

    private fromRequestToCredentials(req: Request) {
        const body = req.body;
        return {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            institution: body.institution,
            userAgent: req.headers['user-agent'] as string,
            host: req.headers['host'] as string
        };
    }
}

export function createRegistrationController(service: IRegistrationPort) {
    return new RegistrationController(service);
}
