import * as path from 'path';

import { importCSVFile } from "../../services/dataImport";
import { logger } from '../../aspects/logging';
import { Catalog, ICatalog } from './../../entities/catalog';

const dataDir = path.join(__dirname, '..', '..', '..', '..', 'data');
const catalogs = {};

function loadAuxilliaryData() {

    Promise.all([
        importCSVFile(path.join(dataDir, "ADV2.csv")),
        importCSVFile(path.join(dataDir, "ADV3.csv")),
        importCSVFile(path.join(dataDir, "ADV4.csv")),
        importCSVFile(path.join(dataDir, "ADV8.csv")),
        importCSVFile(path.join(dataDir, "ADV9.csv")),
        importCSVFile(path.join(dataDir, "ADV12.csv")),
        importCSVFile(path.join(dataDir, "ADV16.csv")),
        importCSVFile(path.join(dataDir, "BW_Grund_Codes.csv")),
        importCSVFile(path.join(dataDir, "BW_Matrix_Codes.csv")),
        importCSVFile(path.join(dataDir, "BW_MatrixOberbegriff_Codes.csv")),
        importCSVFile(path.join(dataDir, "NRLs_u_Erreger.csv")),
        importCSVFile(path.join(dataDir, "PLZ.csv")),
        importCSVFile(path.join(dataDir, "ZSP2017.csv")),
        importCSVFile(path.join(dataDir, "ZSP2018.csv"))
    ]).then(
        function (data) {
            catalogs['adv2'] = new Catalog(<any>data[0], 'Kode');
            catalogs['adv3'] = new Catalog(<any>data[1]);
            catalogs['adv4'] = new Catalog(<any>data[2], 'Kode');
            catalogs['adv8'] = new Catalog(<any>data[3], 'Kode');
            catalogs['adv9'] = new Catalog(<any>data[4], 'Kode');
            catalogs['adv12'] = new Catalog(<any>data[5], 'Kode');
            catalogs['adv16'] = new Catalog(<any>data[6], 'Kode');
            catalogs['bw_grund'] = new Catalog(<any>data[7], 'Kode');
            catalogs['bw_matrix'] = new Catalog(<any>data[8], 'Kode');
            catalogs['bw_ober'] = new Catalog(<any>data[9], 'Kode');
            catalogs['erreger'] = new Catalog(<any>data[10]);
            catalogs['plz'] = new Catalog(<any>data[11], 'plz');
            catalogs['zsp2017'] = new Catalog(<any>data[12]);
            catalogs['zsp2018'] = new Catalog(<any>data[13]);
            logger.info("Imported Auxilliary data");
        }
    );
}

function initialize() {
    loadAuxilliaryData();
}

function getCatalog(catalogName: string): ICatalog<any> {
    return catalogs[catalogName];
}

export {
    initialize,
    getCatalog
}