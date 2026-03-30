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
    // Holds Parse API requests arriving before server.start() completes.
    // Cloud code fires async queries during server.start(), but server.app
    // is only available after start() resolves. This middleware queues those
    // early requests and forwards them once Parse Server is ready.
    let resolveParseReady!: () => void;
    const parseReady = new Promise<void>(resolve => {
        resolveParseReady = resolve;
    });

    app.use(
        '/admin/parse',
        (
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            parseReady.then(() => server.app(req, res, next)).catch(next);
        }
    );

    // Start listening BEFORE server.start() so cloud code queries
    // don't get "connection refused" on port 1337.
    await new Promise<void>(resolve => {
        app.listen(1337, () => {
            logger.info(
                `Parse Server connected to DB ${parseConfig.databaseURI}`
            );
            logger.info(`Parse Server running at ${parseConfig.serverURL}`);
            resolve();
        });
    });

    await server.start();

    // Signal readiness — held requests are now forwarded to server.app.
    resolveParseReady();
}
