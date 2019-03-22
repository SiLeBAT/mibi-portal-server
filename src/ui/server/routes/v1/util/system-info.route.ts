import * as express from 'express';
import { ControllerFactory } from '../../../core/factories/controllerFactory';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('SYSTEM_INFO');

    router.route('/').get(controller.getSystemInfo.bind(controller));
    return router;
}

export { getRouter };
