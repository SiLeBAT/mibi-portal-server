
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IPasswordPort, IController } from '../../../app/ports';

export interface IResetController extends IController {
    reset(req: Request, res: Response): void;
}

class ResetController implements IResetController {

    constructor(private passwordService: IPasswordPort) { }

    async reset(req: Request, res: Response) {
        let dto;
        try {
            await this.passwordService.resetPassword(req.params.token, req.body.newPw);
            dto = {
                title: 'Bitte melden Sie sich mit Ihrem neuen Passwort an' // 'Please login with your new password'
            };
            res.status(200);

        } catch (err) {
            logger.error(`Unable to reset password. error=${err}`);
            dto = {};
            return res
                .status(500);
        }
        logger.info('Response sent', dto);
        return res.json(dto).end();
    }

}

export function createController(service: IPasswordPort) {
    return new ResetController(service);
}
