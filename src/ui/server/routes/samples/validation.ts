import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('VALIDATION');

    router.route('/')
        .post(controller.validateSamples.bind(controller));
    return router;
}

export {
    getRouter
};
