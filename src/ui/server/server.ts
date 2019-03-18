import * as path from 'path';

import * as express from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as morgan from 'morgan';

// local
import { routes } from './routes';
import { logger } from './../../aspects';
import { validateToken } from './middleware';
import { Logger } from '../../aspects/logging';
import { ControllerFactory } from './sharedKernel';

export interface IServerConfig {
    port: number;
    jwtSecret: string;
    apiUrl: string;
    logLevel: string;
    controllerFactory: ControllerFactory;
}

export interface IAppServer {
    startServer(): void;
}

class AppServer implements IAppServer {
    private server: express.Express;

    private publicDir = 'public';

    constructor(config: IServerConfig) {
        this.initialise(config);
    }

    startServer() {
        this.server.listen(this.server.get('port'), () =>
            this.server
                .get('logger')
                .info('API running', { port: this.server.get('port') })
        );
    }

    private initialise(serverConfig: IServerConfig) {
        this.server = express();
        this.server.use(helmet());
        this.server.use(compression());
        this.server.set('port', serverConfig.port);
        this.server.set('logger', logger);
        this.server.set('controllerFactory', serverConfig.controllerFactory);

        this.server.use(bodyParser.json({ limit: '50mb' }));
        this.server.use(
            bodyParser.urlencoded({
                extended: false
            })
        );

        this.server.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'deny');
            res.setHeader(
                'Cache-Control',
                'no-cache, no-store, must-revalidate'
            );
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            return next();
        });

        this.server.use(cors());
        this.server.use(
            morgan(Logger.mapLevelToMorganFormat(serverConfig.logLevel))
        );
        this.server.use(express.static(path.join(__dirname, this.publicDir)));

        this.server.use(this.errorResponses.bind(this));

        routes.init(this.server, validateToken(serverConfig.jwtSecret));

        this.server.get('*', (req: express.Request, res: express.Response) => {
            logger.verbose('AppServer.initialise, Getting index.html');
            res.sendFile(path.join(__dirname, this.publicDir + '/index.html'));
        });
    }

    private errorResponses(
        // tslint:disable-next-line
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        if (err.status === 401) {
            this.server
                .get('logger')
                .warn('Log in attempt with invalid credentials');
            return res.status(401).end();
        }
    }
}

function createApplication(config: IServerConfig): IAppServer {
    return new AppServer(config);
}

export { createApplication };
