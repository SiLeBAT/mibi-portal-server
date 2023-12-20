import {
    ServerConfiguration as ExpressServerConfiguration,
    createServer
} from '@SiLeBAT/fg43-ne-server';
import path from 'path';
import { logger } from '../../aspects';
import {
    GeneralConfiguration,
    ServerConfiguration,
} from '../../main.model';
import {
    API_ROUTE,
    validateToken
} from './ports';

import { Container } from 'inversify';
import { configurationService } from '../../configuratioin.service';


export function initialiseExpress(container: Container) {

    const serverConfig: ServerConfiguration =
        configurationService.getServerConfiguration();
    const generalConfig: GeneralConfiguration =
        configurationService.getGeneralConfiguration();


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
        publicDir: path.join(__dirname + '/public/de')
    };
    const server = createServer(expressServerConfig);
    server.startServer();

    process.on('uncaughtException', error => {
        logger.error(`Uncaught Exception. error=${String(error)}`);
        process.exit(1);
    });
}

