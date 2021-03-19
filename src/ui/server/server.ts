import path from 'path';
import express, { Request, Response } from 'express';
// import helmet from 'helmet';
// import compression from 'compression';
// import cors from 'cors';
// import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { InversifyExpressServer } from 'inversify-express-utils';

// local
import { logger } from './../../aspects';
// import { validateToken } from './middleware/token-validator.middleware';
// import { Logger } from '../../aspects/logging';
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

function parseRedirectUrl(req: any): string {
    // TODO: check check for valid urls
    return req.query.redirect_url ? req.query.redirect_url as string : '/';
}

function followRedirectUrl() {
    return (req: any, res: any) => {
        // TODO: re-add other queries
        res.redirect(parseRedirectUrl(req));
    }
}

function regenerateSession() {
    return (req: any, res: any, next: any) => {
        if (req.kauth && req.kauth.grant) {
            return next();
        }
        // checkSSO failed
        if (req.query.auth_callback) {
            return next();
        }
        // checkSSO redirect
        if (req.session.auth_is_check_sso_complete) {
            return next();
        }
        req.session.regenerate((err: any) => {
            console.log('REGENERATED');
            console.log(req.sessionID);
            next();
        })
    }
}

class ClientAdapter extends KeycloakConnect {
    // we want to logout the client and redirect to the application if authentication failed
    accessDenied(req: any, res: any) {
        // if best match is html redirect to logout, otherwise respond to xhr with auth error
        if (req.accepts(['html', 'json', 'text']) === 'html') {
            let redirectUrl: string;

            if (req.path === '/client/login') {
                redirectUrl = parseRedirectUrl(req);
            } else {
                let urlParts = {
                    pathname: req.path,
                    query: req.query
                };

                delete urlParts.query.error;
                delete urlParts.query.auth_callback;
                delete urlParts.query.state;
                delete urlParts.query.code;
                delete urlParts.query.session_state;

                redirectUrl = url.format(urlParts);
            }

            const logoutUrl = url.format({
                pathname: '/client/logout',
                query: {
                    redirect_url: redirectUrl
                }
            });

            // console.log('TEST: ', logoutUrl);
            res.redirect(logoutUrl);
        } else {
            super.accessDenied(req, res);
        }
    }

    unstoreGrant(sessionId: any) {
        super.unstoreGrant(sessionId);
        console.log('-----------------UNSTORE GRANT');
    }
}

@injectable()
export class DefaultAppServer implements AppServer {
    private server: InversifyExpressServer;

    private publicDir = 'public';

    constructor(container: Container) {
        this.initialize(container);
    }

    startServer() {
        const app = this.server.build();
        app.listen(app.get('port'), () =>
            app.get('logger').info('API running', { port: app.get('port') })
        );
    }

    private initialize(container: Container) {
        const serverConfig = container.get<AppServerConfiguration>(
            SERVER_TYPES.AppServerConfiguration
        );
        const clientBackChannel = new EventEmitter();
        const MemoryStore = createMemoryStore(session);
        const clientSessionStore = new MemoryStore({});
        const clientAuthAdapter = new ClientAdapter(
            { store: clientSessionStore, scope: 'test_scope' },
            // { cookies: true },
            'config/keycloak/keycloak-client.json'
        );

        const apiAuthAdapter = new KeycloakConnect({}, 'config/keycloak/keycloak-api.json');

        const serveClient = () => {
            // TODO: check env for production mode
            return (req: Request, res: Response) => {
                res.redirect('http://localhost:4200' + req.url);
                // res.sendFile(
                // path.join(__dirname, this.publicDir + '/index.html')
                // );
            };
        };

        const clientRouter = express.Router();

        clientRouter.get('/test', (req, res) => {
            res.sendFile(path.join(__dirname, '/test.html'))
        });

        clientRouter.get('/keycloak.json', (req, res) => {
            res.sendFile(path.join(__dirname, '/keycloak.json'))
        });

        clientRouter.get('/favicon.ico', (req, res, next) => {
            next('not fav');
        })

        // bypass direct api calls
        clientRouter.use('/api', (req, res, next) => {
            next('router');
        });

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

        // establish client sessions
        clientRouter.use(
            session({
                secret: 'some secret', // TODO: from config
                resave: false, // TODO
                saveUninitialized: false, // TODO
                // TODO
                cookie: {
                    // secure: 'auto',
                    httpOnly: true,
                    // maxAge: 10000,
                    sameSite: 'lax' // only get request causing a browser navigation
                },
                store: clientSessionStore,
                name: 'mibi.auth-session'
            })
        );

        clientRouter.use((req, res, next) => {
            console.log('client router');
            console.log(req.url + ' : ' + req.hostname + ' : ' + req.headers.host);
            console.log(req.sessionID);
            // console.log(req.session);
            next();
        });

        // set logout redirect uri
        clientRouter.use('/client/logout', (req, res, next) => {
            let redirectUrl = req.query.redirect_url;
            if (redirectUrl) {
                let host = req.hostname;
                let headerHost = req.headers.host;
                let port = headerHost ? headerHost.split(':')[1] || '' : '';
                redirectUrl = req.protocol + '://' + host + (port === '' ? '' : ':' + port) + redirectUrl;
                req.url = url.format({
                    pathname: req.path,
                    query: {
                        redirect_url: redirectUrl
                    }
                });
            }
            // const redirectUrl = req.query.redirect_url ? req.query.redirect_url : '';
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
            // console.log(req.session);
            // console.log(req.kauth?.grant);
            console.log('loggedIn: ', loggedIn);
            next();
        });

        // above keycloak middleware?
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
            // console.log(req.sessionID);
            res.set({
                'Cache-Control': 'no-cache',
                'Content-Type': 'text/event-stream',
                // Connection: 'keep-alive',
                'X-Accel-Buffering': 'no'
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
                res.write('event: auth\ndata: logout\n\n');
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
                'registered clients: ',
                clientBackChannel.listenerCount('admin-request')
            );
        });

        // oauth login flow
        clientRouter.get(
            '/client/login',
            regenerateSession(),
            clientAuthAdapter.protect(),
            followRedirectUrl()
            // (req, res, next) => {
            //     // NEW TAB FLOW
            //     // req.url = '/client/sessioninfo';
            // }
        );

        clientRouter.get('/client/userinfo', (req: any, res, next) => {
            const grant: GrantProperties | undefined = req.kauth?.grant;
            if (grant && grant.access_token) {
                const token = (grant.access_token as any).content;
                console.log((grant.refresh_token as any).content);
                // TODO: check for errors
                res.send({
                    user: {
                        id: token.sub,
                        firstName: token.given_name,
                        lastName: token.family_name,
                        email: token.email,
                        userName: token.preferred_username
                    }
                });
                // userInfo from keycloak
                // clientAuthAdapter.grantManager
                //     .userInfo(grant.access_token)
                //     .then((info: any) => {
                //         // console.log('', info);
                //         res.send({
                //             user: {
                //                 id: info.sub,
                //                 firstName: info.given_name,
                //                 lastName: info.family_name,
                //                 email: info.email,
                //                 userName: info.preferred_username
                //             }
                //         });
                //     })
                //     .catch(next);
            } else {
                res.send({ user: null });
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
            // console.log('SESSION: ', req.session);

            if (req.query.sub) {
                if (!(req.kauth && req.kauth.grant)) {
                    res.status(403);
                    res.end('Access unauthorized');
                    return;
                }
                if (req.query.sub !== req.kauth.grant.access_token.content.sub) {
                    res.status(403);
                    res.end('Access invalid id');
                    return;
                }
                // let urlParts = {
                //     pathname: req.path,
                //     query: req.query
                // };
                // delete urlParts.query.sub;
                // let cleanUrl = url.format(urlParts);
                // req.url = cleanUrl;
            }

            // TODO: do not clear all query params
            // redirect to api and clear all query parameters
            req.url = '/api/v2/' + req.params[0];
            console.log('REPLACED: ', req.url);

            // console.log('HEADER: ', req.headers);
            if (req.kauth && req.kauth.grant) {
                // console.log('GRANT', req.kauth.grant);
                req.headers.authorization =
                    'Bearer ' + (req.kauth.grant.access_token.token as string);
            }
            next('router');
        });

        // fail unsupported client requests
        clientRouter.use('/client', (req, res, next) => {
            next('router');
        });

        // authenticate and serve client for all other routes
        clientRouter.get('*', regenerateSession(), clientAuthAdapter.checkSso(), serveClient());

        const apiRouter = express.Router();

        apiRouter.use((req, res, next) => {
            // console.log('api router');
            // console.log(req.url + ' : ' + req.hostname + ' : ' + req.headers.host);
            next();
        });

        apiRouter.use(
            API_ROUTE.V2 + '/docs',
            swaggerUi.serve,
            swaggerUi.setup(undefined, {
                swaggerUrl: serverConfig.apiRoot + '/api' + API_ROUTE.V2
            })
        );

        // bypass public routes
        apiRouter.get(
            ['/v2', '/v2/info', '/v2/institutes', '/v2/nrls'],
            (req, res, next) => {
                next('router');
            }
        );
        apiRouter.put(
            ['/v2/samples', '/v2/samples/validated'],
            (req, res, next) => {
                next('router');
            }
        );

        // hide keycloak middleware logout endpoint (is for browser flow only)
        apiRouter.use('/logout', (req, res) => {
            apiAuthAdapter.accessDenied(req, res);
        });

        // authenticate api calls
        apiRouter.use(
            apiAuthAdapter.middleware({
                logout: '/logout',
                admin: '/admin'
            })
        );

        apiRouter.use((req: any, res, next) => {
            // console.log(req.kauth);
            next();
        });

        apiRouter.get(
            '/v2/test',
            apiAuthAdapter.protect('apirole'),
            (req, res, next) => {
                res.send({ data: 'confidential' });
            }
        );

        // protect all routes
        apiRouter.use(apiAuthAdapter.protect());

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

            // app.use(
            //     morgan(Logger.mapLevelToMorganFormat(serverConfig.logLevel))
            // );

            // app.use(express.static(path.join(__dirname, this.publicDir)));

            app.use(clientRouter);
            // must be added after clientRouter
            app.use('/api', apiRouter);

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
