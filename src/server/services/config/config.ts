// for production: set JWT_SECRET
// mongo connection: MONGODB_URI

// }
import * as fs from 'fs';
import * as path from 'path';

let configDir = path.join(__dirname, '..', '..', '..', '..', 'config');
let configFilename = path.join(configDir, 'config.json')
let config = JSON.parse(fs.readFileSync(configFilename, 'utf8'));
function configInit() {
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

