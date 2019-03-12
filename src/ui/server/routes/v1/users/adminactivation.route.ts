import * as express from 'express';
import { ControllerFactory } from '../../../sharedKernel';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('REGISTRATION');

    router.route('/:token').post(controller.adminactivate.bind(controller));
    return router;
}

export { getRouter };
