// core
import * as fs from 'fs';
import * as path from 'path';

// npm
import * as express from 'express';
import * as multer from 'multer';
import * as rootDir from 'app-root-dir';
import * as unirest from 'unirest';
// local
import { logger } from './../../aspects/logging';
// FIXME
import { knimeConfig } from './../../interactors/initializeSystem';
import { validateSampleForm } from './../../controllers';

let appRootDir = rootDir.get();
const uploadDir = 'uploads/';

const uploadPath = path.join(appRootDir, uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

export const router = express.Router();

let storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    console.log('inside storage, file: ', file);
    // var datetimestamp = Date.now();
    cb(null, Date.now() + '.' + file.originalname);
  }
});

let multerUpload = multer({ //multer settings
  storage: storage
}).single('myPostName');

router.post('/', function (req, res) {

  logger.info('File POST request received')

  if (req.is('application/json')) {
    return validateSampleForm(req, res);
  }
  else {
    multerUpload(req, res, function (err) {
      if (err) {
        // An error occurred when uploading
        logger.error('error during upload, err: ', err);
        return res
          .status(400)
          .json({
          });
      }

      // file upload went fine, continue knime validation workflow...
      const uploadedFilePath = path.join(appRootDir, req.file.path);
      getKnimeJobId(req, res, uploadedFilePath);
    });
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

      console.log(response.raw_body);
      console.log('going for knime validation...');
      const jobId = response.body['id'];

      console.log('typeof jobId: ', (typeof jobId));

      doKnimeValidation(req, res, jobId, filePath);
    });

}


function doKnimeValidation(req, res, jobId, filePath) {

  console.log('doUnirestKnimeValidation!');

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
        console.log('knime validation error: ', response.error);

        return res
          .status(400)
          .json({
            title: 'knime validation error',
            obj: response.error
          });
      }

      console.log(response.raw_body);

      return res
        .status(200)
        .json({
          title: 'file upload and knime validation ok',
          obj: response.raw_body
        });
    });
}

