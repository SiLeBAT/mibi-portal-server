// core
import * as path from 'path';
import * as fs from 'fs';

// npm
import * as express from 'express';
import * as rootDir from 'app-root-dir';
import * as unirest from 'unirest';
import * as config from 'config';

// local
import { logger } from './../../../../aspects';
import { validateSamples } from './../controllers';

interface IKnimeConfig {
    user: string;
    pass: string;
    urlJobId: string;
    urlResult: string;
}

const knimeConfig: IKnimeConfig = config.get('knime');
const appRootDir = rootDir.get();

export const router = express.Router();

router.post('/', function (req, res) {
    if (req.is('application/json')) {
        return validateSamples(req, res);
    }
    else {
        const uploadedFilePath = path.join(appRootDir, req.file.path);
        getKnimeJobId(req, res, uploadedFilePath);
    }

});

function getKnimeJobId(req, res, filePath) {
    logger.info('Retrieving Knime Job ID.')

    const urlJobId = knimeConfig.urlJobId;
    const user = knimeConfig.user;
    const pass = knimeConfig.pass;

    unirest
        .post(urlJobId)
        .auth({
            user: user,
            pass: pass
        })
        .end((response) => {
            if (response.error) {
                logger.error('knime id error: ', response.error);

                return res
                    .status(400)
                    .json({
                        title: 'knime id error',
                        obj: response.error
                    });
            }

            const jobId = response.body['id'];
            doKnimeValidation(req, res, jobId, filePath);
        });

}

function doKnimeValidation(req, res, jobId, filePath) {

    const urlResult = knimeConfig.urlResult + jobId;
    const user = knimeConfig.user;
    const pass = knimeConfig.pass;

    unirest
        .post(urlResult)
        .headers({
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
        })
        .auth({
            user: user,
            pass: pass
        })
        .attach({
            'file-upload-210': fs.createReadStream(filePath)
        })
        .end((response) => {
            if (response.error) {
                logger.error('knime validation error: ', response.error);

                return res
                    .status(400)
                    .json({
                        title: 'knime validation error',
                        obj: response.error
                    });
            }

            return res
                .status(200)
                .json({
                    title: 'file upload and knime validation ok',
                    obj: response.raw_body
                });
        });
}

