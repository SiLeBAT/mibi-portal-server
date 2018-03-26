import * as express from 'express';
import { IControllerFactory } from '../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('INSTITUTION');

    router.route('/')
        .get(controller.listInstitutions.bind(controller));
    return router;
}

export {
    getRouter
};
