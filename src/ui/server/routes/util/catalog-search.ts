import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('CATALOG_SEARCH');

    router.route('/')
        .post(controller.searchCatalog.bind(controller));
    return router;
}

export {
    getRouter
};
