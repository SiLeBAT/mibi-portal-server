import * as winston from 'winston';
import * as config from 'config';

// tslint:disable-next-line
(winston as any).level = mapLogLevels(config.get('server.logLevel'));

/*
*
* Log levels are:
*   error: 0,
*   warn: 1,
*   info: 2,
*   verbose: 3,
*   debug: 4,
*   trace: 5
*
*/
class Logger {
    // tslint:disable-next-line
    error(msg: string, meta?: any) {
        winston.log('error', msg, meta);
    }

    // tslint:disable-next-line
    warn(msg: string, meta?: any) {
        winston.log('warn', msg, meta);
    }

    // tslint:disable-next-line
    info(msg: string, meta?: any) {
        winston.log('info', msg, meta);
    }

    // tslint:disable-next-line
    verbose(msg: string, meta?: any) {
        winston.log('verbose', msg, meta);
    }

    // tslint:disable-next-line
    debug(msg: string, meta?: any) {
        winston.log('debug', msg, meta);
    }

    // tslint:disable-next-line
    trace(msg: string, meta?: any) {
        winston.log('silly', msg, meta);
    }
}

function mapLogLevels(level: string): string {
    switch (level) {
        case 'trace':
            return 'silly';
        case 'info':
            return level;
        case 'error':
            return level;
        case 'verbose':
            return level;
        case 'warn':
            return level;
        case 'silly':
            return level;
        default:
            return 'info';
    }
}

const logger = new Logger();

export {
    logger
};
