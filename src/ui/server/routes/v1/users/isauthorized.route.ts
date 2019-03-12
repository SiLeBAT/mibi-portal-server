import * as express from 'express';
import { ControllerFactory } from '../../../sharedKernel';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('AUTHORIZATION');

    router.route('/').post(controller.isAuthorized.bind(controller));
    return router;
}

export { getRouter };
