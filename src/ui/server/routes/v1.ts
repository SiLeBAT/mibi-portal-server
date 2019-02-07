import * as express from 'express';
import { getRouter as getBaseRouter, RouterType } from './routerProvider';
import { IControllerFactory } from '../sharedKernel';
import { logger } from '../../../aspects';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/institutions' });
    router.use(
        '/institutions',
        getBaseRouter(RouterType.INSTITUTIONS, controllerFactory)
    );
    logger.verbose('Registering Route', { route: '/validation' });
    router.use(
        '/validation',
        getBaseRouter(RouterType.VALIDATE, controllerFactory)
    );
    logger.verbose('Registering Route', { route: '/job' });
    router.use('/job', getBaseRouter(RouterType.JOB, controllerFactory));
    logger.verbose('Registering Route', { route: '/users' });
    router.use('/users', getBaseRouter(RouterType.USER, controllerFactory));
    logger.verbose('Registering Route', { route: '/catalog-search' });
    router.use('/util', getBaseRouter(RouterType.UTIL, controllerFactory));
    return router;
}

export { getRouter };
