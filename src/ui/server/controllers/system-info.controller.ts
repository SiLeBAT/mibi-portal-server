import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IController } from '../../../app/ports';
const pjson = require('../../../../package.json');

export interface ISystemInfoController extends IController {
    getSystemInfo(req: Request, res: Response): Promise<void>;
}

class SystemInfoController implements ISystemInfoController {
    async getSystemInfo(req: Request, res: Response) {
        logger.info('SystemInfoController.getSystemInfo, Request received');
        let dto;
        try {
            dto = {
                version: pjson.version,
                lastChange: pjson.mibiConfig.lastChange
            };
            res.status(200);
        } catch (err) {
            logger.error(`Unable to retrieve system information. error=${err}`);
            dto = {
                version: undefined,
                lastChange: undefined
            };
            res.status(500);
        }
        logger.info('SystemInfoController.getSystemInfo, Response sent');
        return res.json(dto).end();
    }
}

export function createController() {
    return new SystemInfoController();
}
