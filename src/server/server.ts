import * as path from 'path';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

// local
import { validateToken } from './core';
import { routes } from './api';
import { logger } from './../aspects';

export interface IServerConfig {
    port: number;
    jwtSecret: string;
    apiUrl: string;
}

export interface IAppServer {
    start(): void;
}

class AppServer implements IAppServer {

    private server: express.Express;

    private publicDir = 'public';

    constructor(config: IServerConfig) {
        this.initialise(config);
    }

    start() {
        this.server.listen(this.server.get('port'), () => this.server.get('logger').info('API running', { 'port': this.server.get('port') }));
    }

    private initialise(config: IServerConfig) {
        this.server = express();
        this.server.set('port', config.port);
        this.server.set('logger', logger);

        this.server.use(bodyParser.json());
        this.server.use(bodyParser.urlencoded({
            extended: false
        }));

        this.server.use(validateToken(config.jwtSecret));

        this.server.use(cors());

        this.server.use(express.static(path.join(__dirname, this.publicDir)));

        this.server.use(this.errorResponses.bind(this));

        routes.init(this.server);

        this.server.get('*', (req: express.Request, res: express.Response) => {
            logger.verbose('Getting index.html');
            res.sendFile(path.join(__dirname, this.publicDir + '/index.html'));
        });
    }

    // tslint:disable-next-line
    private errorResponses(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (err.status === 401) {
            this.server.get('logger').warn('Log in attempt with invalid credentials');
            this.server.get('logger').error('Log in attempt with invalid credentials 2');
            return res
                .status(401)
                .end();
        }
    }
}

function createServer(config: IServerConfig): IAppServer {

    const server = new AppServer(config);

    return server;
}

export {
    createServer
};
