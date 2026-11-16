// eslint-disable-next-line @typescript-eslint/no-require-imports
const FSFilesAdapter = require('@parse/fs-files-adapter');
import config from 'config';
import express from 'express';
import { ParseServer } from 'parse-server';
import { logger } from './../../aspects';
import schemaDefinitions from './mibi-schema.json';

interface ParseServerConfig extends Record<string, unknown> {
    databaseURI: string;
    serverURL: string;
    schema?: Record<string, unknown>;
}

// Defined Schema (https://docs.parseplatform.org/defined-schema/guide/):
// Parse Server migrates the DB to mibi-schema.json on start, before the cloud
// code is loaded. These options only add classes, fields and indexes; nothing
// is deleted. They can be overridden per environment via parseServer.schema.
const DEFAULT_SCHEMA_OPTIONS = {
    strict: false,
    lockSchemas: false,
    deleteExtraFields: false,
    recreateModifiedFields: false,
    keepUnknownIndexes: true
};

const parseServer: ParseServerConfig = config.get('parseServer');
const dataDir: string = config.get('dataStore.dataDir');
const fsAdapter = new FSFilesAdapter({
    filesSubDirectory: '../' + dataDir
});
const app = express();
const parseConfig = {
    ...parseServer,
    filesAdapter: fsAdapter,
    schema: {
        ...DEFAULT_SCHEMA_OPTIONS,
        ...parseServer.schema,
        definitions: schemaDefinitions
    }
};
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
