import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { Controller } from '../model/controler.model';
import { generateToken } from '../../../app/ports';

export interface AuthorizationController extends Controller {
    isAuthorized(req: Request, res: Response): Promise<void>;
}

interface AuthorizationResponseDTO {
    authorized: boolean;
    token?: string;
}

interface IDTokenTuple {
    id: string;
    token: string;
}

class DefaultAuthorizationController implements AuthorizationController {
    async isAuthorized(req: Request, res: Response) {
        const idTokenTuple: IDTokenTuple = this.mapRequestDTOToIDTokenTuple(
            req
        );
        logger.info(
            'DefaultAuthorizationController.isAuthorized, Request received'
        );
        try {
            const token = generateToken(idTokenTuple.id);
            const dto: AuthorizationResponseDTO = {
                authorized: true,
                token: token
            };
            logger.info(
                'DefaultAuthorizationController.isAuthorized, Response sent'
            );
            res.status(200).json(dto);
        } catch (err) {
            logger.error(`Authorization failed. error=${err}`);
            res.status(401).json({
                authorized: false
            });
        }
        return res.end();
    }

    private mapRequestDTOToIDTokenTuple(req: Request) {
        return {
            token: req.body.token,
            id: req.body._id
        };
    }
}

export function createController() {
    return new DefaultAuthorizationController();
}
