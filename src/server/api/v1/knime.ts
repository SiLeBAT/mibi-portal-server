import * as express from 'express';
export const router = express.Router();

router.post('/', upload);

function upload(req, res, next) {
  // TODO: externalize config values?
  const urlJobId = 'https://knime.bfrlab.de/com.knime.enterprise.server/rest/v4/repository/EpiLab/MiBi-Portal_v14_03:jobs';
  const urlResult = 'https://knime.bfrlab.de/com.knime.enterprise.server/rest/v4/jobs/';
  const authValue = req.body.authValue;
  console.log('authValue: ', authValue);

  return res
    .status(200)
    .json({
      title: 'knime upload was called'
    });

}
