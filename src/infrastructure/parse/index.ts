import config from 'config';
import express from 'express';
import { ParseServer } from 'parse-server';
import { logger } from './../../aspects';

// tslint:disable-next-line: no-any
const parseServer: any = config.get('parseServer');

const app = express();

const server = new ParseServer({ ...parseServer });

// Start server
server.start().then(() => {
    // Serve the Parse API on the /parse URL prefix
    app.use('/admin/parse', server.app);

    app.listen(1337, function () {
        logger.info('Parse-server running on port 1337.');
    });
});
