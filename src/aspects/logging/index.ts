/* istanbul ignore file */
import winston from 'winston';
import config from 'config';
import { TransformableInfo } from 'logform';

interface LogConfiguration {
    logLevel: string;
}
const logConfiguration: LogConfiguration = config.get('general');
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
    private _logger: winston.Logger;

    constructor() {
        let logLevel: string = 'error';
        try {
            logLevel = logConfiguration.logLevel;
        } catch (err) {
            // tslint:disable-next-line:no-console
            console.warn(
                'Log Level configuration not found. Using default: ' + logLevel
            );
        }

        this._logger = winston.createLogger({
            level: Logger.mapLogLevels(logLevel),
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => Logger.mapLogMessage(info))
            ),
            transports: [new winston.transports.Console()]
        });
    }

    static mapLogMessage(info: TransformableInfo): string {
        let logMsg = `${info.level} ${info.message}`;
        logMsg =
            info.meta !== undefined
                ? logMsg +
                  ' ' +
                  (typeof info.meta === 'object'
                      ? JSON.stringify(info.meta)
                      : (info.meta as string))
                : logMsg;

        return logMsg;
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

    // tslint:disable-next-line
    error(msg: string, meta?: any) {
        this._logger.log('error', msg, { meta: meta });
    }

    // tslint:disable-next-line
    warn(msg: string, meta?: any) {
        this._logger.log('warn', msg, { meta: meta });
    }

    // tslint:disable-next-line
    info(msg: string, meta?: any) {
        this._logger.log('info', msg, { meta: meta });
    }

    // tslint:disable-next-line
    verbose(msg: string, meta?: any) {
        this._logger.log('verbose', msg, { meta: meta });
    }

    // tslint:disable-next-line
    debug(msg: string, meta?: any) {
        this._logger.log('debug', msg, { meta: meta });
    }

    // tslint:disable-next-line
    trace(msg: string, meta?: any) {
        this._logger.log('silly', msg, { meta: meta });
    }
}

const logger = new Logger();

export { logger };
