import * as express from 'express';
import { logger } from './../../aspects';
import { router as v1 } from './v1';
import { router as userRoute } from './deprecated/users';

export const apiRoute = express.Router();

apiRoute.use('/v1', v1);

function init(server) {
    server.use('/api', apiRoute);
    server.use('/users', userRoute);
}

export const routes = {
    init
}