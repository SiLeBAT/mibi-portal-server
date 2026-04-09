import ParseDefault, * as Parse from 'parse/node';
import { DataStore } from '../../model/data-store.model';
import { logger } from './../../../../aspects';
import { initSchema } from './schema/init-schema';

export interface ParseConnectionInfo {
    serverURL: string;
    appId: string;
    masterKey: string;
    host: string;
    database: string;
    username: string;
    password: string;
    authDatabase: string;
}

class ParseDataStore implements DataStore {
    constructor(parseConnectionInfo: ParseConnectionInfo) {
        const logString =
            '{ "host":"' +
            parseConnectionInfo.host +
            '", "authDB":"' +
            parseConnectionInfo.authDatabase +
            '", "db":"' +
            parseConnectionInfo.database +
            '" }';

        ParseDefault.initialize(
            parseConnectionInfo.appId,
            undefined,
            parseConnectionInfo.masterKey
        );
        // tslint:disable-next-line:no-any
        (ParseDefault as any).serverURL = parseConnectionInfo.serverURL;

        Parse.Schema.all()
            .then(() => {
                logger.info('Connected to DB', logString);
                return;
            })
            .catch((error: Parse.Error) => {
                throw new Error(
                    `Unable to connect to DB. ${logString} error=${error.message}`
                );
            });
    }
}

export async function createDataStore(
    parseConnectionInfo: ParseConnectionInfo
): Promise<DataStore> {
    logger.info('Creating parse datastore');
    const dataStore = new ParseDataStore(parseConnectionInfo);
    await initSchema(parseConnectionInfo);
    return dataStore;
}
