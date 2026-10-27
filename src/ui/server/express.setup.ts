import { logger } from '../../aspects';
import { GeneralConfiguration, ServerConfiguration } from '../../main.model';
import { API_ROUTE } from './ports';

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { ParseSessionStore } from './middleware/parse-session.store';
import { resolveActorContext } from './middleware/actor-context.middleware';
import { ensureCsrfCookie } from './middleware/csrf-cookie.middleware';
import { configurationService } from '../../configuratioin.service';
import { startHttpServer } from './http-server';
import { AppComposition } from './composition-root';
import { PUBLIC_DIR } from './client-version';

/**
 * Decides which requests bypass CSRF protection.
 *
 * Only the machine-to-machine results import does. It authenticates with a
 * secret the caller sends explicitly, not with an ambient browser credential,
 * so there is nothing for a cross-site request to ride on: no browser attaches
 * X-MiBi-Api-Key on its own, and a custom header forces a CORS preflight
 * anyway. Double-submit protection would only block the legitimate script and
 * KNIME callers.
 *
 * Matched exactly, never by prefix, so the exemption cannot widen to the
 * cookie-authenticated routes. Exported so that stays regression-tested.
 */
export function isCsrfExemptPath(apiRoot: string, path: string): boolean {
    return path === apiRoot + API_ROUTE.V2 + '/orders/results';
}

export function initialiseExpress(composition: AppComposition) {
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
        },
        skipCsrfProtection: req =>
            isCsrfExemptPath(serverConfig.apiRoot, req.path)
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

    // Gives Angular an XSRF-TOKEN cookie to read, without rotating it under
    // in-flight requests - see the middleware for why that matters.
    customApp.use(ensureCsrfCookie(generateToken));

    customApp.use(doubleCsrfProtection);

    // The HTTP server's error handler only responds to err.status === 401 and
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

    customApp.use(resolveActorContext(composition.actorContextService));

    startHttpServer({
        controllers: composition.controllers,
        customApp,
        apiRoot: serverConfig.apiRoot,
        apiVersion: API_ROUTE.V2,
        port: serverConfig.port,
        logLevel: generalConfig.logLevel,
        jwtSecret: generalConfig.jwtSecret,
        resultsApiKey: generalConfig.resultsApiKey,
        publicDir: PUBLIC_DIR
    });

    process.on('uncaughtException', error => {
        logger.error(`Uncaught Exception. error=${String(error)}`);
        process.exit(1);
    });
}
