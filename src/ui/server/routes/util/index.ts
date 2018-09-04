// DEPRECATED
// FIXME: Only exists for backward compatibility until the REST interface is cleaned up
import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';
import { logger } from '../../../../aspects';
import { getRouter as getBaseRouter, RouterType } from '../routerProvider';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/catalog-search' });
    router.use('/catalog-search', getBaseRouter(RouterType.CATALOG_SEARCH, controllerFactory));
    return router;
}

export {
    getRouter
};
