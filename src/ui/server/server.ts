import path from 'path';
import express, { Request, Response } from 'express';
// import helmet from 'helmet';
// import compression from 'compression';
// import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { InversifyExpressServer } from 'inversify-express-utils';

// local
import { logger } from './../../aspects';
// import { validateToken } from './middleware/token-validator.middleware';
import { Logger } from '../../aspects/logging';
import { API_ROUTE, SERVER_ERROR_CODE } from './model/enums';
import { AppServerConfiguration } from './model/server.model';
import { injectable, Container } from 'inversify';
import { SERVER_TYPES } from './server.types';
import KeycloakConnect, { GrantProperties } from 'keycloak-connect';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { EventEmitter } from 'events';
import url from 'url';

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
        const clientBackChannel = new EventEmitter();
        const MemoryStore = createMemoryStore(session);
        const clientSessionStore = new MemoryStore({});
        const clientAuthAdapter = new KeycloakConnect(
            { store: clientSessionStore, scope: 'test_scope' },
            'keycloak-client.json'
        );
        clientAuthAdapter.accessDenied = (req, res) => {
            res.redirect('/auth_result/access_denied');
        };
        const apiAuthAdapter = new KeycloakConnect({}, 'keycloak-api.json');

        const serveClient = () => {
            return (req: Request, res: Response) => {
                res.redirect('http://localhost:4200' + req.url);
                // res.sendFile(
                // path.join(__dirname, this.publicDir + '/index.html')
                // );
            };
        };

        const clientRouter = express.Router();

        // bypass direct api calls
        clientRouter.use('/api', (req, res, next) => {
            next('router');
        });

        // establish client sessions
        clientRouter.use(
            session({
                secret: 'some secret', // TODO
                resave: false, // TODO
                saveUninitialized: false, // TODO
                // TODO
                // cookie: {
                //     secure: 'auto',
                //     httpOnly: true,
                //     maxAge: 3600000
                // },
                store: clientSessionStore
                // name: 'mibisession' // TODO
            })
        );

        clientRouter.use((req, res, next) => {
            console.log('client router');
            console.log(req.url);
            console.log(req.hostname);
            console.log(req.headers.host);
            console.log(req.sessionID);
            next();
        });

        // set logout redirect uri
        clientRouter.use('/client/logout', (req, res, next) => {
            req.url = url.format({
                pathname: req.path,
                query: {
                    redirect_url: 'http://localhost:3000/auth_result/logged_out'
                }
            });
            next();
        });

        // hook on admin events handled by keycloak middleware
        clientRouter.use('/client/admin', (req, res, next) => {
            res.on('close', () => {
                if (res.statusCode === 200) {
                    clientBackChannel.emit('admin-request');
                }
            });
            next();
        });

        // NEW TAB FLOW
        // clientRouter.get('/client/logout', (req, res, next) => {
        //     req.url = '/client/logout?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fclient%2Fsessioninfo';
        //     next();
        // });

        // authenticate clients
        clientRouter.use(
            clientAuthAdapter.middleware({
                logout: '/client/logout',
                admin: '/client/admin'
            })
        );

        clientRouter.use((req: any, res, next) => {
            console.log('AFTER KEYCLOAK');
            const loggedIn = req.kauth && req.kauth.grant ? true : false;
            // const sessionLoggedIn = req.session && req.session.keycloak_token;
            console.log('loggedIn: ', loggedIn);
            next();
        });

        // inform clients about backchannel logout events
        clientRouter.get('/client/backchannel', (req, res, next) => {
            if (
                !req.headers.accept ||
                req.headers.accept !== 'text/event-stream'
            ) {
                next('false header');
                return;
            }
            console.log('EVENT');
            if (!req.session) {
                console.log('event no session');
                res.end();
            }
            console.log(req.sessionID);
            res.set({
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
                Connection: 'keep-alive'
            });
            res.flushHeaders();
            res.write('retry: 10000\n\n');
            const heartbeat = setInterval(() => {
                res.write(':heartbeat\n\n');
            }, 30000);
            const adminRequestHandler = () => {
                console.log('TRIGGERED');
                console.log(req.sessionID);
                // const rand = Math.floor(Math.random() * 10000);
                res.write('event: backchannel\ndata: logout\n\n');
            };
            req.on('close', () => {
                console.log('EVENT REQ CLOSED');
                clearInterval(heartbeat);
                clientBackChannel.removeListener(
                    'admin-request',
                    adminRequestHandler
                );
            });
            res.on('close', () => {
                console.log('EVENT RES CLOSED');
            });

            clientBackChannel.on('admin-request', adminRequestHandler);
            console.log(
                'registerd clients: ',
                clientBackChannel.listenerCount('admin-request')
            );
        });

        // oauth login flow
        clientRouter.get(
            '/client/login',
            clientAuthAdapter.protect(),
            (req, res, next) => {
                res.redirect('/auth_result/logged_in');
                // NEW TAB FLOW
                // req.url = '/client/sessioninfo';
            }
        );

        clientRouter.get('/client/userinfo', (req: any, res, next) => {
            const grant: GrantProperties | undefined = req.kauth?.grant;
            if (grant && grant.access_token) {
                clientAuthAdapter.grantManager
                    .userInfo(grant.access_token)
                    .then((info: any) => {
                        console.log('', info);
                        res.send({
                            id: info.sub,
                            firstName: info.given_name,
                            lastName: info.family_name,
                            email: info.email,
                            userName: info.preferred_username
                        });
                    })
                    .catch(next);
            } else {
                res.send({ error: 'not found' });
            }
        });

        // NEW TAB FLOW
        // clientRouter.get('/client/sessioninfo', (req: any, res) => {
        //     if(req.session) {
        //         console.log('EMIT');
        //         clientBackChannel.emit('testevent', req.sessionID);
        //     }
        //     const loggedIn = (req.kauth && req.kauth.grant) ? true : false;
        //     const stateString = loggedIn ? 'Logged In' : 'Logged Out';
        //     console.log('SESSION INFO');
        //     console.log(req.sessionID);

        //     res.send(`
        //         <html>
        //         <script>
        //         window.onload=() => {
        //         if(window.opener) {
        //             window.setTimeout(() => {
        //                 window.close();
        //             }, 1000);
        //         } else {
        //             var einzufuegendesObjekt = document.createElement("a");
        //             einzufuegendesObjekt.href = "/";
        //             einzufuegendesObjekt.innerHTML = "to application";
        //             var vorhandenesObjekt = document.getElementById("placeholder");
        //             vorhandenesObjekt.appendChild(einzufuegendesObjekt);
        //         }
        //     }
        //         </script>
        //         <body>
        //         <h1>${stateString}</h1>
        //         <div id="placeholder"></div>
        //         </body>
        //         </html>
        //         `
        //     );
        // });

        // forward client api calls to versioned api endpoints
        clientRouter.all('/client/api/*', (req: any, res, next) => {
            req.url = req.url.replace('client/api', 'api/v2'); // TODO make more safe
            console.log('REPLACED: ', req.url);
            if (req.kauth && req.kauth.grant) {
                req.headers.authorization =
                    'Bearer ' + (req.kauth.grant.access_token.token as string);
            }
            next('router');
        });

        // fail unsupported client requests
        clientRouter.use('/client', (req, res, next) => {
            next('router');
        });

        // authentication already checked, so serve client directly
        clientRouter.get('/auth_result/*', serveClient());

        // ignore index.html so it is not served by the static file middleware
        clientRouter.get('/index.html', (req, res, next) => {
            req.url = '/';
            next();
        });

        // serve static files
        clientRouter.use(
            express.static(path.join(__dirname, this.publicDir), {
                index: false, // prevents auto redirecting '/' routes to '/index.html'
                redirect: false // prevents adding a trailing '/' to the routes (causes unecessary browser redirects)
            })
        );

        // authenticate and serve client for all other routes
        clientRouter.get('/*', clientAuthAdapter.checkSso(), serveClient());

        const apiAuthRouter = express.Router();

        apiAuthRouter.use((req, res, next) => {
            console.log('api router');
            console.log(req.url);
            console.log(req.hostname);
            console.log(req.headers.host);
            next();
        });

        // bypass public routes
        apiAuthRouter.get(
            ['/v2/info', '/v2/institutes', '/v2/nrls'],
            (req, res, next) => {
                next('router');
            }
        );
        apiAuthRouter.put(
            ['/v2/samples', '/v2/samples/validated'],
            (req, res, next) => {
                next('router');
            }
        );

        // hide keycloak middleware logout endpoint (is for browser flow only)
        apiAuthRouter.use('/logout', (req, res) => {
            apiAuthAdapter.accessDenied(req, res);
        });

        // authenticate api calls
        apiAuthRouter.use(
            apiAuthAdapter.middleware({
                logout: '/logout',
                admin: '/admin'
            })
        );

        apiAuthRouter.use((req: any, res, next) => {
            next();
        });

        apiAuthRouter.get(
            '/v2/test',
            apiAuthAdapter.protect('apirole'),
            (req, res, next) => {
                res.send({ data: 'confidential' });
            }
        );

        // protect all routes
        apiAuthRouter.use(apiAuthAdapter.protect());

        const serverConfig = container.get<AppServerConfiguration>(
            SERVER_TYPES.AppServerConfiguration
        );
        this.server = new InversifyExpressServer(container, null, {
            // rootPath: serverConfig.apiRoot
            rootPath: '/api'
        });
        this.server.setConfig(app => {
            // app.use(helmet());
            // app.use(compression());
            app.set('port', serverConfig.port);
            app.set('logger', logger);

            app.use(express.json({ limit: '50mb' }));
            // app.use(
            //     express.urlencoded({
            //         extended: false
            //     })
            // );

            // app.use((req, res, next) => {
            //     res.setHeader('X-Frame-Options', 'deny');
            //     res.setHeader(
            //         'Cache-Control',
            //         'no-cache, no-store, must-revalidate'
            //     );
            //     res.setHeader('Pragma', 'no-cache');
            //     res.setHeader('X-XSS-Protection', '1; mode=block');
            //     res.setHeader('X-Content-Type-Options', 'nosniff');
            //     next();
            // });

            // app.set('trust proxy', true);

            // app.use(cors());

            app.use(
                morgan(Logger.mapLevelToMorganFormat(serverConfig.logLevel))
            );

            // app.use(express.static(path.join(__dirname, this.publicDir)));

            app.use(
                serverConfig.apiRoot + '/api/docs' + API_ROUTE.V2,
                swaggerUi.serve,
                swaggerUi.setup(undefined, {
                    swaggerUrl: serverConfig.apiRoot + '/api' + API_ROUTE.V2
                })
            );

            app.use(clientRouter);
            // must be added after clientRouter
            app.use('/api', apiAuthRouter);

            // app.use(
            //     serverConfig.apiRoot + API_ROUTE.V2 + '/*',
            //     validateToken(
            //         serverConfig.apiRoot + API_ROUTE.V2,
            //         serverConfig.jwtSecret
            //     )
            // );
        });

        this.server.setErrorConfig((app: any) => {
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
                    } else {
                        next(err);
                    }
                }
            );

            // app.get('*', (req: express.Request, res: express.Response) => {
            //     res.sendFile(
            //         path.join(__dirname, this.publicDir + '/index.html')
            //     );
            // });
        });
    }
}

function createServer(container: Container): AppServer {
    return new DefaultAppServer(container);
}

export { createServer };
