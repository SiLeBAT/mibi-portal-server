import * as express from 'express';
import { ControllerFactory } from '../../../sharedKernel';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('REGISTRATION');

    router.route('/:token').post(controller.activate.bind(controller));
    return router;
}

export { getRouter };
