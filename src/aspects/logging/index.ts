import * as winston from 'winston';

// tslint:disable-next-line
(winston as any).level = 'silly';

class Logger {

    // tslint:disable-next-line
    info(msg: string, meta?: any) {
        winston.log('info', msg, meta);
    }

    // tslint:disable-next-line
    error(msg: string, meta?: any) {
        winston.log('error', msg, meta);
    }

    // tslint:disable-next-line
    debug(msg: string, meta?: any) {
        winston.log('debug', msg, meta);
    }

    // tslint:disable-next-line
    warn(msg: string, meta?: any) {
        winston.log('warn', msg, meta);
    }

    // tslint:disable-next-line
    trace(msg: string, meta?: any) {
        winston.log('silly', msg, meta);
    }

    // tslint:disable-next-line
    verbose(msg: string, meta?: any) {
        winston.log('verbose', msg, meta);
    }
}

const logger = new Logger();

export {
    logger
};
