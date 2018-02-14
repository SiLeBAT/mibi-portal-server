// core
import * as http from 'http';
import * as path from 'path';

// npm
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as expressJwt from 'express-jwt';
import * as processenv from 'processenv';

// local
import { logger } from './server/aspects/logging';
import * as database from './server/database/mongoose';
import { configInit } from './server/services/config/config';
import { router as user } from './server/routes/user';
import { router as api } from './server/api';



configInit();
database.initialize(processenv('MONGODB_URI'));
const app = express();

logger.info('Runtime Environment', {
  'process.env.NODE_ENV': processenv('NODE_ENV'),
  'process.env.NODE_PORT': processenv('NODE_PORT'),
  'process.env.API_URL': processenv('API_URL')
});


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


// use JWT auth to secure the api, the token is passed in the authorization header
app.use(expressJwt({
  secret: process.env.JWT_SECRET,
  getToken: function (req) {
    if (req.headers.authorization && (<string>req.headers.authorization).split(' ')[0] === 'Bearer') {
      return (<string>req.headers.authorization).split(' ')[1];
    }
    return null;
  }
}).unless({
  path: [
    '/api/v1/institutions',
    '/users/login',
    '/users/register',
    '/users/recovery',
    /\/users\/reset\/*/,
    /\/users\/activate\/*/
  ]
}));

// verify token expiration
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res
      .status(401);
  }
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, PATCH, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", 'true');
  next();
});



// Set api routes, forwards any request to the routes
app.use('/users', user);
app.use('/api', api);

// Catch all other routes and return the index file, angular handles all errors
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// Get port from environment and store in Express
// const port = process.env.NODE_ENV === 'production' ? 80 : process.env.NODE_PORT;
const port = processenv('NODE_PORT');


app.set('port', port);


// Create HTTP server
const server = http.createServer(app);


// Listen on provided port, on all network interfaces
server.listen(port, () => logger.info('API running', { 'port': port }));






