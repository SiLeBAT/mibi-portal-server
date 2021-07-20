import path from 'path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { InversifyExpressServer } from 'inversify-express-utils';

// local
import { logger } from './../../aspects';
import { validateToken } from './middleware/token-validator.middleware';
import { Logger } from '../../aspects/logging';
import { SERVER_ERROR_CODE, API_ROUTE } from './model/enums';
import { AppServerConfiguration } from './model/server.model';
import { injectable, Container } from 'inversify';
import { SERVER_TYPES } from './server.types';

export interface AppServer {
    startServer(): void;
}

@injectable()
export class DefaultAppServer implements AppServer {
    private server: InversifyExpressServer;

    private publicDir = 'public';

    constructor(container: Container) {
        this.initialise(container);
    }

    startServer() {
        const app = this.server.build();
        app.listen(app.get('port'), () =>
            app.get('logger').info('API running', { port: app.get('port') })
        );
    }

    private initialise(container: Container) {
        const serverConfig = container.get<AppServerConfiguration>(
            SERVER_TYPES.AppServerConfiguration
        );
        this.server = new InversifyExpressServer(container, null, {
            rootPath: serverConfig.apiRoot
        });
        this.server.setConfig(app => {
            app.set('port', serverConfig.port);
            app.set('logger', logger);

            app.disable('x-powered-by');

            // Common security headers
            app.use(
                helmet({
                    frameguard: {
                        action: 'deny'
                    },
                    contentSecurityPolicy: {
                        useDefaults: true,
                        directives: {
                            'script-src': [
                                "'self'",
                                "'unsafe-eval'",
                                "'unsafe-inline'"
                            ],
                            'script-src-attr': null // not supported by firefox
                        }
                    }
                })
            );

            app.use((req, res, next) => {
                res.setHeader(
                    'Cache-Control',
                    'no-store, must-revalidate, max-age=0'
                );
                // deprecated (helmet sets it to "0")
                res.setHeader('X-XSS-Protection', '1; mode=block');
                next();
            });

            app.use(cors());

            app.use(compression());
            app.use(express.json({ limit: '50mb' }));

            app.use(
                morgan(Logger.mapLevelToMorganFormat(serverConfig.logLevel))
            );

            app.use(express.static(path.join(__dirname, this.publicDir)));

            app.use(
                serverConfig.apiRoot + '/api-docs' + API_ROUTE.V2,
                swaggerUi.serve,
                swaggerUi.setup(undefined, {
                    swaggerUrl: serverConfig.apiRoot + API_ROUTE.V2
                })
            );

            app.use(
                serverConfig.apiRoot + API_ROUTE.V2 + '/*',
                validateToken(
                    serverConfig.apiRoot + API_ROUTE.V2,
                    serverConfig.jwtSecret
                )
            );
        });

        this.server.setErrorConfig(app => {
            app.use(
                (
                    // tslint:disable-next-line
                    err: any,
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    if (err.status === 401) {
                        app.get('logger').warn(
                            `Log caused error with status 401. error=${err}`
                        );
                        res.status(401)
                            .send({
                                code: SERVER_ERROR_CODE.AUTHORIZATION_ERROR,
                                message: err.message
                            })
                            .end();
                    }
                }
            );

            app.get('*', (req: express.Request, res: express.Response) => {
                res.sendFile(
                    path.join(__dirname, this.publicDir + '/index.html')
                );
            });
        });
    }
}

function createServer(container: Container): AppServer {
    return new DefaultAppServer(container);
}

export { createServer };
