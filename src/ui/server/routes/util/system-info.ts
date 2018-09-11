import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('SYSTEM_INFO');

    router.route('/')
        .get(controller.getSystemInfo.bind(controller));
    return router;
}

export {
    getRouter
};
