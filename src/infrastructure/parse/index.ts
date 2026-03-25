const FSFilesAdapter = require('@parse/fs-files-adapter');
import config from 'config';
import express from 'express';
// import { ParseServer } from 'parse-server';
const ParseServer = require('parse-server').ParseServer;
import { logger } from './../../aspects';

// tslint:disable-next-line: no-any
const parseServer: any = config.get('parseServer');
const dataDir: string = config.get('dataStore.dataDir');
const fsAdapter = new FSFilesAdapter({
    filesSubDirectory: '../' + dataDir
});
const app = express();
const parseConfig = { ...parseServer, filesAdapter: fsAdapter };
const server = new ParseServer(parseConfig);

export async function startParseServer() {
    await server.start();
    app.use('/admin/parse', server.app);
    app.listen(1337, () => {
        logger.info(`Parse Server connected to DB ${parseConfig.databaseURI}`);
        logger.info(`Parse Server running at ${parseConfig.serverURL}`);
    });
}
