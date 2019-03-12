import * as express from 'express';
import { ControllerFactory } from '../../sharedKernel';
import { IDatasetController } from '../..';

function getRouter(controllerFactory: ControllerFactory) {
    const router = express.Router();
    const controller: IDatasetController = controllerFactory.getController(
        'DATASET'
    );

    router.route('/').post(controller.submitDataset.bind(controller));
    return router;
}

export { getRouter };
