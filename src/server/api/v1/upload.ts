// core
import * as fs from 'fs';
import * as path from 'path';

// npm
import * as express from 'express';
import * as multer from 'multer';
import * as rootDir from 'app-root-dir';
import * as unirest from 'unirest';
import { knimeConfig } from './../../services/config/config';

let appRootDir = rootDir.get();

export const router = express.Router();

let storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
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

   multerUpload(req, res, function (err) {
     if (err) {
       // An error occurred when uploading
      console.log('error during upload, err: ', err);
       return res
       .status(400)
       .json({
       });
     }
 
    // file upload went fine, continue knime validation workflow...
    const uploadedFilePath = path.join(appRootDir, req.file.path);
    // const uploadedFilePath = '/home/bpo/data/projects/workspace/epilab/data/Einsendebogen-v14_TEST.xlsx';
    getKnimeJobId(req, res, uploadedFilePath);

    // const jobId = 'e681e2e3-7902-4538-aa91-30614c0ef20f';
    // doKnimeValidation(req, res, jobId, uploadedFilePath);
  });
});

function getKnimeJobId(req, res, filePath) {

  console.log('getUnirestKnimeJobId!');

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
      console.log('knime id error: ', response.error);

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

