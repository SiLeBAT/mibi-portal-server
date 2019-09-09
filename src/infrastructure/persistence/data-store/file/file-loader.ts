import { CatalogConfig } from './../../../../app/ports';
import * as path from 'path';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import { logger } from '../../../../aspects';
import { FileNotFoundError } from '../../model/domain.error';

interface CSVImportOptions {
    filePath: string;
    filterFunction: Function;
    mappingFunction: Function;
    headers: boolean;
    delimiter: string;
}
async function loadBinaryFile(
    fileName: string,
    dataDir: string
): Promise<Buffer> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importBinaryFile(filePath);
}

async function loadCSVFile<T>(
    catalogConfig: CatalogConfig,
    dataDir: string
): Promise<T[]> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${
            catalogConfig.filename
        } dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(catalogConfig.filename, dataDir);
    return importCSVFile<T>({
        filePath,
        filterFunction: catalogConfig.filterFunction
            ? catalogConfig.filterFunction
            : () => true,
        headers: !!catalogConfig.headers,
        delimiter: catalogConfig.delimiter ? catalogConfig.delimiter : ',',
        mappingFunction: catalogConfig.mappingFunction
            ? catalogConfig.mappingFunction
            : (e: T) => e
    });
}

async function loadJSONFile(fileName: string, dataDir: string): Promise<{}> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importJSONFile(filePath);
}

async function importCSVFile<T>(options: CSVImportOptions): Promise<T[]> {
    const data: T[] = [];

    return new Promise<T[]>(function(resolve, reject) {
        csv.fromPath(options.filePath, {
            headers: options.headers,
            delimiter: options.delimiter
        })
            .on('data', function(entry) {
                if (options.filterFunction(entry)) {
                    data.push(options.mappingFunction(entry));
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

// tslint:disable-next-line: no-any
async function importBinaryFile(filePath: string): Promise<any> {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function resolveFilePath(fileName: string, dataDir: string) {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
        return filePath;
    } else {
        throw new FileNotFoundError(`File not found. fileName=${fileName}`);
    }
}

export { loadCSVFile, loadJSONFile, loadBinaryFile };
