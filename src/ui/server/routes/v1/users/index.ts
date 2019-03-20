import * as express from 'express';
import { getRouter as getRegisterRouter } from './registration.route';
import { getRouter as getLoginRouter } from './login.route';
import { getRouter as getResetRouter } from './reset.route';
import { getRouter as getActivateRouter } from './activation.route';
import { getRouter as getAdminActivateRouter } from './adminactivation.route';
import { getRouter as getRecoveryRouter } from './recovery.route';
import { getRouter as getIsAuthorizedRouter } from './isauthorized.route';
import { ControllerFactory } from '../../../core/factories/controllerFactory';
import { logger } from '../../../../../aspects';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    logger.verbose('Registering Route', { route: '/login' });
    router.use('/login', getLoginRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/register' });
    router.use('/register', getRegisterRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/recovery' });
    router.use('/recovery', getRecoveryRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/reset' });
    router.use('/reset', getResetRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/activate' });
    router.use('/activate', getActivateRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/adminactivate' });
    router.use('/adminactivate', getAdminActivateRouter(controllerFactory));
    logger.verbose('Registering Route', { route: '/isauthorized' });
    router.use('/isauthorized', getIsAuthorizedRouter(controllerFactory));
    return router;
}

export { getRouter };
