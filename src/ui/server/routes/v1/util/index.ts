import * as express from 'express';
import { ControllerFactory } from '../../../core/factories/controllerFactory';
import { logger } from '../../../../../aspects';
import { getRouter as getSystemInfoRouter } from './system-info.route';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/system-info' });
    router.use('/system-info', getSystemInfoRouter(controllerFactory));
    return router;
}

export { getRouter };
