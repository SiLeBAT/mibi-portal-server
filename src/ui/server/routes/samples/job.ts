import * as express from 'express';
import { IControllerFactory } from '../../sharedKernel';
import { IDatasetController } from '../..';

function getRouter(controllerFactory: IControllerFactory) {
    const router = express.Router();
    const controller: IDatasetController = controllerFactory.getController(
        'DATASET'
    );

    router.route('/').post(controller.submitDataset.bind(controller));
    return router;
}

export { getRouter };
