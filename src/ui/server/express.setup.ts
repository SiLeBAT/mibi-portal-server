import {
    ServerConfiguration as ExpressServerConfiguration,
    createServer
} from '@SiLeBAT/fg43-ne-server';
import path from 'path';
import { logger } from '../../aspects';
import { GeneralConfiguration, ServerConfiguration } from '../../main.model';
import { API_ROUTE, validateToken } from './ports';

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { ParseSessionStore } from './middleware/parse-session.store';
import { resolveActorContext } from './middleware/actor-context.middleware';
import { Container } from 'inversify';
import { configurationService } from '../../configuratioin.service';
import { APPLICATION_TYPES } from '../../app/application.types';
import { ActorContextService } from '../../app/authentication/model/actor.model';

export function initialiseExpress(container: Container) {
    const serverConfig: ServerConfiguration =
        configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration =
        configurationService.getGeneralConfiguration();
    const sessionConfig = configurationService.getSessionConfiguration();
    const { doubleCsrfProtection, generateToken } = doubleCsrf({
        getSecret: () => sessionConfig.secret,
        cookieName: 'XSRF-TOKEN',
        cookieOptions: {
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        },
        // Angular's HttpClientXsrfModule sends the full cookie value (token|hash)
        // as the header. csrf-csrf expects just the token, so strip the hash here.
        // The hash is still validated server-side against the secret.
        getTokenFromRequest: req => {
            const header = req.headers['x-xsrf-token'] as string | undefined;
            return header ? header.split('|')[0] : '';
        }
    });

    const customApp = express();

    customApp.use(cookieParser());

    customApp.use(
        session({
            secret: sessionConfig.secret,
            store: new ParseSessionStore(sessionConfig.ttlSeconds),
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: sessionConfig.ttlSeconds * 1000
            }
        })
    );

    // Set XSRF-TOKEN cookie on every GET so Angular can read it
    customApp.use((req, res, next) => {
        if (req.method === 'GET') {
            generateToken(req, res, true);
        }
        next();
    });

    customApp.use(doubleCsrfProtection);

    // fg43-ne-server's error handler only responds to err.status === 401 and
    // silently drops everything else, so we have to terminate CSRF rejections here
    // or the request hangs forever.
    customApp.use(
        (
            err: { code?: string } & Error,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            if (
                err?.code === 'EBADCSRFTOKEN' ||
                err?.code === 'ERR_BAD_CSRF_TOKEN'
            ) {
                res.status(403).json({
                    code: 2,
                    message: 'Invalid CSRF token'
                });
                return;
            }
            next(err);
        }
    );

    const actorContextService = container.get<ActorContextService>(
        APPLICATION_TYPES.ActorContextService
    );
    customApp.use(resolveActorContext(actorContextService));

    const expressServerConfig: ExpressServerConfiguration = {
        container,
        api: {
            root: serverConfig.apiRoot,
            version: API_ROUTE.V2,
            port: serverConfig.port,
            docPath: '/'
        },
        logging: {
            logger,
            logLevel: generalConfig.logLevel
        },
        tokenValidation: {
            validator: validateToken,
            jwtSecret: generalConfig.jwtSecret
        },
        publicDir: path.join(__dirname + '/public/de'),
        customApp
    };
    const server = createServer(expressServerConfig);
    server.startServer();

    process.on('uncaughtException', error => {
        logger.error(`Uncaught Exception. error=${String(error)}`);
        process.exit(1);
    });
}
