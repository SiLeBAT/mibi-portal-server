import * as express from 'express';
import { getRouter as getValidationRouter } from './validation.route';
import { getRouter as getJobRouter } from './job.route';
import { getRouter as getInstitutionsRouter } from './institution.route';
import { getRouter as getUserRouter } from './users';
import { getRouter as getUtilRouter } from './util';
import { ControllerFactory } from '../../sharedKernel';
import { logger } from '../../../../aspects';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/institutions' });
    router.use('/institutions', getInstitutionsRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/validation' });
    router.use('/validation', getValidationRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/job' });
    router.use('/job', getJobRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/users' });
    router.use('/users', getUserRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/catalog-search' });
    router.use('/util', getUtilRouter(controllerFactory));
    return router;
}

export { getRouter };
