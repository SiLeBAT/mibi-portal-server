import { multerUpload } from './../middleware';
import { logger } from './../../../../aspects';

function saveDataset(req, res) {
    multerUpload(req, res, function (err) {
        if (err) {
            logger.error("Unable to save Dataset.");
            return res
                .status(400)
                .end();
        }
        // FIXME: Temporary redirect to allow for feature parity with old version
        res.redirect(307, 'validation');
    });
}

export {
    saveDataset
}