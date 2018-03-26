import { Response, Request } from 'express';
import { IController } from '../../../app/ports';
import { multerUpload } from './../middleware';
import { logger } from '../../../aspects';
import { IValidationController } from '.';

export interface IDatasetController extends IController {
    saveDataset(req: Request, res: Response): void;
}

class DatasetController implements IDatasetController {

    constructor(private controller: IValidationController) { }
    saveDataset(req: Request, res: Response) {
        const that = this;
        multerUpload(req, res, function (err: Error) {
            if (err) {
                logger.error('Unable to save Dataset', { error: err });
                return res
                    .status(400)
                    .end();
            }
            // FIXME: Temporary redirect to allow for feature parity with old version
            logger.warn('Redirecting request to different controller');
            return that.controller.validateSamples(req, res);
        });
    }

}

export function createController(controller: IValidationController) {
    return new DatasetController(controller);
}
