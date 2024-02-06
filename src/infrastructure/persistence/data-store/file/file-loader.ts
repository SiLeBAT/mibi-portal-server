import path from 'path';
import fs from 'fs';
import { logger } from '../../../../aspects';
import { FileNotFoundError } from '../../model/domain.error';
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

async function loadJSONFile(fileName: string, dataDir: string): Promise<{}> {
    logger.verbose(
        `Loading data from Filesystem. fileName=${fileName} dataDir=${dataDir}`
    );
    const filePath = resolveFilePath(fileName, dataDir);
    return importJSONFile(filePath);
}

async function importJSONFile(filePath: string): Promise<{}> {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, 'utf8', function (err, data) {
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
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, data) {
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

export { loadJSONFile, loadBinaryFile };
