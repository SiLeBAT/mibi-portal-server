import * as express from 'express';
import { ControllerFactory } from '../../core/factories/controllerFactory';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller = controllerFactory.getController('INSTITUTION');

    router.route('/').get(controller.listInstitutions.bind(controller));
    return router;
}

export { getRouter };
