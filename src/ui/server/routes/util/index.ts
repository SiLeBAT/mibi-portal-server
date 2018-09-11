import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';
import { logger } from '../../../../aspects';
import { getRouter as getBaseRouter, RouterType } from '../routerProvider';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/catalog-search' });
    router.use('/catalog-search', getBaseRouter(RouterType.CATALOG_SEARCH, controllerFactory));
    logger.verbose('Registering Route', { route: '/system-info' });
    router.use('/system-info', getBaseRouter(RouterType.SYSTEM_INFO, controllerFactory));
    return router;
}

export {
    getRouter
};
