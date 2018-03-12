import { Response, Request } from 'express';
import { multerUpload } from './../middleware';
import { logger } from './../../../../aspects';
import { validateSamples } from '../../validation/controllers';

function saveDataset(req: Request, res: Response) {
    multerUpload(req, res, function (err) {
        if (err) {
            logger.error('Unable to save Dataset.');
            return res
                .status(400)
                .end();
        }
        // FIXME: Temporary redirect to allow for feature parity with old version
        return validateSamples(req, res);
    });
}

export {
    saveDataset
};
