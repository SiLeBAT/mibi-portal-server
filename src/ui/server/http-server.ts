import path from 'path';
import express, { Application } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { logger } from '../../aspects';
import { validateToken } from './ports';
import { buildControllerRouter } from './routes';
import { Controllers } from './server.factory';

export interface HttpServerConfiguration {
    controllers: Controllers;
    // Pre-configured Express app carrying the app-level middleware (session,
    // CSRF, actor context) wired up in express.setup.ts.
    customApp: Application;
    apiRoot: string;
    apiVersion: string;
    port: number;
    logLevel: string;
    jwtSecret: string;
    publicDir: string;
}

/**
 * Assembles the HTTP server on plain Express and starts listening.
 *
 * Controller routing is registered via buildControllerRouter (plain Express
 * Router). Controllers are constructed by the composition root; there is no
 * DI container.
 */
export function startHttpServer(config: HttpServerConfiguration): void {
    const app = config.customApp;

    app.disable('x-powered-by');

    const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'"];
    const styleSources = ["'self'", "'unsafe-inline'"];
    const connectSources = ['https://mibi-portal.bfr.bund.de/', 'https://fg43-support.bfr.berlin', "'self'"];

    // Common security headers
    app.use(
        helmet({
            frameguard: {
                action: 'deny'
            },
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: scriptSources,
                    scriptSrcElem: scriptSources,
                    styleSrc: styleSources,
                    connectSrc: connectSources,
                    'script-src-attr': null // not supported by firefox
                }
            }
        })
    );

    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, must-revalidate, max-age=0');
        // deprecated (helmet sets it to "0")
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    app.use(cors());
    app.use(compression());
    app.use(express.json({ limit: '50mb' }));
    app.use(morgan(mapLevelToMorganFormat(config.logLevel)));
    app.use(express.static(config.publicDir));

    const apiPath = config.apiRoot + config.apiVersion;
    app.use(
        config.apiRoot + '/' + config.apiVersion,
        swaggerUi.serve,
        swaggerUi.setup(undefined, {
            swaggerUrl: apiPath
        })
    );

    // JWT validation for all API routes. Wrapped in a sync handler so Express
    // sees a void-returning RequestHandler and any rejection reaches next(err).
    const jwtMiddleware = validateToken(apiPath, config.jwtSecret);
    app.use(apiPath + '/*splat', (req, res, next) => {
        jwtMiddleware(req, res, next).catch(next);
    });

    // Controller routes
    app.use(config.apiRoot || '/', buildControllerRouter(config.controllers));

    app.use(
        (
            err: { status?: number; message?: string } & Error,
            req: express.Request,
            res: express.Response,
            _next: express.NextFunction
        ) => {
            if (err.status === 401) {
                logger.warn(`Log caused error with status 401. error=${err}`);
                res.status(401)
                    .send({
                        code: 2,
                        message: err.message
                    })
                    .end();
            }
        }
    );

    // SPA fallback: any unmatched route serves the client entry point.
    app.get('/*splat', (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(config.publicDir + '/index.html'));
    });

    app.listen(config.port, () => {
        logger.info('API running', { port: config.port });
    });
}

function mapLevelToMorganFormat(level: string): string {
    switch (level) {
        case 'trace':
            return 'dev';
        case 'info':
            return 'combined';
        case 'error':
            return 'combined';
        case 'verbose':
            return 'dev';
        case 'warn':
            return 'combined';
        case 'silly':
            return 'dev';
        case 'debug':
            return 'dev';
        default:
            return 'info';
    }
}
