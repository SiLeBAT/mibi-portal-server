import * as path from 'path';
import * as fs from 'fs';
import * as config from 'config';
import * as csv from 'fast-csv';
import * as rootDir from 'app-root-dir';

import { logger } from './../../../aspects';
import { ICatalogRepository, ICatalog, Catalog } from './../../../app/ports';

declare type CatalogData = Record<string, string>;

interface CatalogConfig {
    filename: string;
    id: string;
    uId?: string;
}

class FileCatalogRepository implements ICatalogRepository {
    private catalogs: {
        [key: string]: ICatalog<CatalogData>;
    };
    constructor(private dataDir: string) {
        this.dataDir = this.dataDir || path.join(rootDir.get(), 'data');
        this.catalogs = {};
    }

    initialise() {
        logger.verbose('FileCatalogRepository.initialize, Loading Catalog data from Filesystem', { dataDir: this.dataDir });

        const catalogsConfig: CatalogConfig[] = [
            {
                filename: 'ADV2.csv',
                id: 'adv2',
                uId: 'Kode'
            },
            {
                filename: 'ADV3.csv',
                id: 'adv3'
            },
            {
                filename: 'ADV4.csv',
                id: 'adv4',
                uId: 'Kode'
            },
            {
                filename: 'ADV8.csv',
                id: 'adv8',
                uId: 'Kode'
            },
            {
                filename: 'ADV9.csv',
                id: 'adv9',
                uId: 'Kode'
            },
            {
                filename: 'ADV12.csv',
                id: 'adv12',
                uId: 'Kode'
            },
            {
                filename: 'ADV16.csv',
                id: 'adv16',
                uId: 'Kode'
            },
            {
                filename: 'BW_Grund_Codes.csv',
                id: 'bw_grund',
                uId: 'Kode'
            },
            {
                filename: 'BW_Matrix_Codes.csv',
                id: 'bw_matrix',
                uId: 'Kode'
            },
            {
                filename: 'BW_MatrixOberbegriff_Codes.csv',
                id: 'bw_ober',
                uId: 'Kode'
            },
            {
                filename: 'NRLs_u_Erreger.csv',
                id: 'erreger'
            },
            {
                filename: 'PLZ.csv',
                id: 'plz',
                uId: 'plz'
            },
            {
                filename: 'ZSP2017.csv',
                id: 'zsp2017'
            },
            {
                filename: 'ZSP2018.csv',
                id: 'zsp2018'
            }
        ];

        const promiseArray = catalogsConfig.map(catalogConfig => {
            const filePath = path.join(this.dataDir, catalogConfig.filename);
            if (fs.existsSync(filePath)) {
                return this.importCSVFile(filePath).then(
                    (data: CatalogData[]) => this.catalogs[catalogConfig.id] = new Catalog<CatalogData>(data, catalogConfig.uId)
                );
            } else {
                return new Promise((resolve, reject) => {
                    logger.warn('Catalog missing on Filesystem', { catalog: catalogConfig.filename });
                    this.catalogs[catalogConfig.id] = new Catalog<CatalogData>([], catalogConfig.uId);
                    resolve();
                });
            }
        });

        return Promise.all(promiseArray).then(
            data => logger.info('Finished initialising Catalog Repository from Filesystem', { dataDir: this.dataDir })
        );
    }

    getCatalog(catalogName: string): ICatalog<CatalogData> {
        return this.catalogs[catalogName];
    }

    private importCSVFile(filePath: string): Promise<CatalogData[]> {
        let data: CatalogData[] = [];

        return new Promise(function (resolve, reject) {
            csv
                .fromPath(filePath, { headers: true })
                .on('data', function (entry) {
                    data.push(entry);
                })
                .on('end', function () {
                    resolve(data);
                });
        });
    }
}
export const repository = new FileCatalogRepository(config.get('dataStore.dataDir'));

export function initialiseRepository() {
    return repository.initialise().then(
        () => repository
    );
}
