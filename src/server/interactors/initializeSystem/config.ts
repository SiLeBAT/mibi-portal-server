import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../../aspects/logging';

// FIXME: Refactor - config as entity?  externalize mail & knime
const configDir = path.join(__dirname, '..', '..', '..', '..', 'config');
const configFilename = path.join(configDir, 'config.json')
const config = JSON.parse(fs.readFileSync(configFilename, 'utf8'));

function configInit() {
  setUpEnvironment(config);
}


function setUpEnvironment(config) {
  let env = process.env.NODE_ENV || 'development';
  // load json file with test and config variables which is not part of git repository
  // if (env === 'development' || env === 'test') {

  let envConfig = config[env];
  console.log(envConfig);
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  })
}


// console.log("config.js: config.mail.fromAddress: ", config.mail.fromAddress);
const mailConfig = config.mail;
const knimeConfig = config.knime;

export {
  mailConfig,
  knimeConfig,
  configInit
}

