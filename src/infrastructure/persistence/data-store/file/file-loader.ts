import path from 'path';
import fs from 'fs';
import csv from 'fast-csv';
import { logger } from '../../../../aspects';
import { FileNotFoundError } from '../../model/domain.error';
import { CSVConfig } from '../../model/file-loader.model';
import _ from 'lodash';

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

async function loadCSVFile<T extends string, R>(
    fileName: string,
    dataDir: string,
    config: CSVConfig<T, R>
): Promise<R[]> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importCSVFile<T, R>(filePath, config);
}

async function loadJSONFile(fileName: string, dataDir: string): Promise<{}> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importJSONFile(filePath);
}

async function importCSVFile<T extends string, R>(
    filePath: string,
    options: CSVConfig<T, R>
): Promise<R[]> {
    const data: R[] = [];

    const headers =
        options.headers === true ? true : prepareCSVHeaders(options.headers);

    return new Promise<R[]>(resolve => {
        csv.fromPath(filePath, {
            headers: headers,
            delimiter: options.delimiter || ',',
            ignoreEmpty: true,
            discardUnmappedColumns: true
        })
            .on('data', function(entry) {
                if (!options.filterFunction || options.filterFunction(entry)) {
                    data.push(options.mappingFunction(entry));
                }
            })
            .on('end', function() {
                resolve(data);
            });
    });
}

function prepareCSVHeaders(headers: Record<string, number>): string[] {
    return _.reduce(
        _.entries(headers),
        (acc, [name, index]) => {
            acc[index] = name;
            return acc;
        },
        new Array<string>()
    );
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
