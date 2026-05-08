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
import { doubleCsrf } from 'csrf-csrf';
import { ParseSessionStore } from './middleware/parse-session.store';
import { Container } from 'inversify';
import { configurationService } from '../../configuratioin.service';

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
        getTokenFromRequest: req => req.headers['x-xsrf-token'] as string
    });

    const customApp = express();

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
