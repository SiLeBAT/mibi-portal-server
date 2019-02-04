import * as express from 'express';
import { getRouter as getV1Router } from './v1';
import { logger } from '../../../aspects';

function init(server: express.Express) {
	const apiRoute = express.Router();
	logger.verbose('Registering Route', { route: '/v1' });
	apiRoute.use('/v1', getV1Router(server.get('controllerFactory')));
	logger.verbose('Registering Route', { route: '/api' });
	server.use('/api', apiRoute);
	logger.info('Finished initalising server routes');
}

export const routes = {
	init
};
