import * as express from 'express';
import { ControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('VALIDATION');

    router.route('/').post(controller.validateSamples.bind(controller));
    return router;
}

export { getRouter };
