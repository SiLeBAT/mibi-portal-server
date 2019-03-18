import * as express from 'express';
import { getRouter as getV1Router } from './v1';
import { logger } from '../../../aspects';
import { RequestHandler } from 'express-unless';

function init(server: express.Express, validationFunction: RequestHandler) {
    const apiRoute = express.Router();
    logger.verbose('Registering Route', { route: '/v1' });
    apiRoute.use(validationFunction);
    apiRoute.use('/v1', getV1Router(server.get('controllerFactory')));
    logger.verbose('Registering Route', { route: '/api' });
    server.use('/api', apiRoute);
    logger.info('Finished initalising server routes');
}

export const routes = {
    init
};
