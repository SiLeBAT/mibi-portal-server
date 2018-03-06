import * as path from 'path';

import * as csv from "fast-csv"
import * as rootDir from 'app-root-dir';

import { logger, ServerError } from './../../../../aspects';
import { Catalog, ICatalog } from './../entities';
import { ICatalogRepository } from './../interactors';

class FileCatalogRepository implements ICatalogRepository {
    private dataDir: string;
    private catalogs;
    constructor() {
        this.dataDir = path.join(rootDir.get(), 'data');
        this.catalogs = {};
    }

    public initialise() {
        logger.verbose("Loading Catalog data from directory: ", this.dataDir);
        return Promise.all([
            this.importCSVFile(path.join(this.dataDir, "ADV2.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV3.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV4.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV8.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV9.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV12.csv")),
            this.importCSVFile(path.join(this.dataDir, "ADV16.csv")),
            this.importCSVFile(path.join(this.dataDir, "BW_Grund_Codes.csv")),
            this.importCSVFile(path.join(this.dataDir, "BW_Matrix_Codes.csv")),
            this.importCSVFile(path.join(this.dataDir, "BW_MatrixOberbegriff_Codes.csv")),
            this.importCSVFile(path.join(this.dataDir, "NRLs_u_Erreger.csv")),
            this.importCSVFile(path.join(this.dataDir, "PLZ.csv")),
            this.importCSVFile(path.join(this.dataDir, "ZSP2017.csv")),
            this.importCSVFile(path.join(this.dataDir, "ZSP2018.csv"))
        ]).then(
            (data) => {
                this.catalogs['adv2'] = new Catalog(<any>data[0], 'Kode');
                this.catalogs['adv3'] = new Catalog(<any>data[1]);
                this.catalogs['adv4'] = new Catalog(<any>data[2], 'Kode');
                this.catalogs['adv8'] = new Catalog(<any>data[3], 'Kode');
                this.catalogs['adv9'] = new Catalog(<any>data[4], 'Kode');
                this.catalogs['adv12'] = new Catalog(<any>data[5], 'Kode');
                this.catalogs['adv16'] = new Catalog(<any>data[6], 'Kode');
                this.catalogs['bw_grund'] = new Catalog(<any>data[7], 'Kode');
                this.catalogs['bw_matrix'] = new Catalog(<any>data[8], 'Kode');
                this.catalogs['bw_ober'] = new Catalog(<any>data[9], 'Kode');
                this.catalogs['erreger'] = new Catalog(<any>data[10]);
                this.catalogs['plz'] = new Catalog(<any>data[11], 'plz');
                this.catalogs['zsp2017'] = new Catalog(<any>data[12]);
                this.catalogs['zsp2018'] = new Catalog(<any>data[13]);
            }
        );

    }

    public getCatalog(catalogName: string): ICatalog<any> {
        return this.catalogs[catalogName];
    }

    private importCSVFile(filePath: string) {
        let data: any[] = []

        return new Promise(function (resolve, reject) {
            csv
                .fromPath(filePath, { headers: true })
                .on("data", function (entry) {
                    data.push(entry);
                })
                .on("end", function () {
                    resolve(data)
                });
        });
    };
}

function create(): Promise<ICatalogRepository> {
    const repository = new FileCatalogRepository();
    return repository.initialise().then(
        () => {
            logger.info("Catalog data successfully loaded.")
            return repository;
        }
    ).catch(
        (error) => {
            logger.error("Repository initialisation failure: Unable to initialise FileCatalogRepository", error)
            throw new ServerError(error);
        }
    );
}

export {
    create
}