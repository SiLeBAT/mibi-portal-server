import * as winston from 'winston';
import * as config from 'config';

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
export class Logger {

    private _logger: winston.LoggerInstance;

    constructor() {
        const tsFormat = () => (new Date()).toLocaleTimeString();
        this._logger = new (winston.Logger)({
            transports: [
                // colorize the output to the console
                new (winston.transports.Console)({
                    timestamp: tsFormat,
                    colorize: true,
                    level: Logger.mapLogLevels(config.get('server.logLevel'))
                })
            ]
        });

    }

    static mapLogLevels(level: string): string {
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
            case 'debug':
                return level;
            default:
                return 'info';
        }
    }

    static mapLevelToMorganFormat(level: string): string {
        switch (level) {
            case 'trace':
                return 'dev';
            case 'info':
                return 'combined';
            case 'error':
                return 'combined';
            case 'verbose':
                return 'dev';
            case 'warn':
                return 'combined';
            case 'silly':
                return 'dev';
            case 'debug':
                return 'dev';
            default:
                return 'info';
        }
    }

    // tslint:disable-next-line
    error(msg: string, meta?: any) {
        this._logger.log('error', msg, meta);
    }

    // tslint:disable-next-line
    warn(msg: string, meta?: any) {
        this._logger.log('warn', msg, meta);
    }

    // tslint:disable-next-line
    info(msg: string, meta?: any) {
        this._logger.log('info', msg, meta);
    }

    // tslint:disable-next-line
    verbose(msg: string, meta?: any) {
        this._logger.log('verbose', msg, meta);
    }

    // tslint:disable-next-line
    debug(msg: string, meta?: any) {
        this._logger.log('debug', msg, meta);
    }

    // tslint:disable-next-line
    trace(msg: string, meta?: any) {
        this._logger.log('silly', msg, meta);
    }
}

const logger = new Logger();

export {
    logger
};
