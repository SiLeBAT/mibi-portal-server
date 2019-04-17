import * as express from 'express';
import { ControllerFactory } from '../../core/factories/controllerFactory';
import { DatasetController } from '../../controllers/dataset.controller';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller: DatasetController = controllerFactory.getController(
        'DATASET'
    );

    router.route('/').post(controller.submitDataset.bind(controller));
    return router;
}

export { getRouter };
