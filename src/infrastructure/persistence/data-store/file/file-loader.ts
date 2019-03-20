import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as rootDir from 'app-root-dir';
import { logger } from '../../../../aspects';
import {
    ApplicationSystemError,
    DataStoreConfiguration,
    getConfigurationService
} from '../../../../app/ports';

const dataStoreConfig: DataStoreConfiguration = getConfigurationService().getDataStoreConfiguration();

const dataDir = dataStoreConfig.dataDir || path.join(rootDir.get(), 'data');

async function loadCSVFile<T>(
    fileName: string,
    filterFunction?: Function
): Promise<T[]> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName);
    return importCSVFile<T>(filePath, filterFunction);
}

async function loadJSONFile(fileName: string): Promise<{}> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName);
    return importJSONFile(filePath);
}

async function importCSVFile<T>(
    filePath: string,
    entryFilter: Function = () => true
): Promise<T[]> {
    const data: T[] = [];

    return new Promise<T[]>(function(resolve, reject) {
        csv.fromPath(filePath, { headers: true })
            .on('data', function(entry) {
                if (entryFilter(entry)) {
                    data.push(entry);
                }
            })
            .on('end', function() {
                resolve(data);
            });
    });
}

async function importJSONFile(filePath: string): Promise<{}> {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) {
                reject(err);
            } else {
                const jsonContent = JSON.parse(data);
                resolve(jsonContent);
            }
        });
    });
}

function resolveFilePath(fileName: string) {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        throw new ApplicationSystemError(
            `File not found. fileName=${fileName}`
        );
    }
}

export { loadCSVFile, loadJSONFile };
