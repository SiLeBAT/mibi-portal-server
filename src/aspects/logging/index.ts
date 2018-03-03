import * as winston from 'winston';

winston.level = 'silly';

class Logger {

    public info(msg: string, meta?: any) {
        winston.log('info', msg, meta);
    }

    public error(msg: string, meta?: any) {
        winston.log('error', msg, meta);
    }

    public debug(msg: string, meta?: any) {
        winston.log('debug', msg, meta);
    }

    public warn(msg: string, meta?: any) {
        winston.log('warn', msg, meta);
    }

    public trace(msg: string, meta?: any) {
        winston.log('silly', msg, meta);
    }

    public verbose(msg: string, meta?: any) {
        winston.log('verbose', msg, meta);
    }
}

const logger = new Logger();

export {
    logger
}