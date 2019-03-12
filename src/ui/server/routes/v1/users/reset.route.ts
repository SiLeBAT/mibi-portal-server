import * as express from 'express';
import { ControllerFactory } from '../../../sharedKernel';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('RESET');

    router.route('/:token').post(controller.reset.bind(controller));
    return router;
}

export { getRouter };
