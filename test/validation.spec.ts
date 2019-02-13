import * as fs from 'fs';
import * as path from 'path';
import * as config from 'config';
import * as _ from 'lodash';
import * as moment from 'moment';
import axios from 'axios';
import { WorkBook, WorkSheet, readFile, utils } from 'xlsx';
import { logger } from '../src/aspects';
moment.locale('de');

type SampleData = Record<string, string>;
const ENDPOINT = '/api/v1/validation';
const API_URL = config.get('server.apiUrl');
const DATA_DIR: string = 'testData';
const FORM_PROPERTIES: string[] = [
    'sample_id',
    'sample_id_avv',
    'pathogen_adv',
    'pathogen_text',
    'sampling_date',
    'isolation_date',
    'sampling_location_adv',
    'sampling_location_zip',
    'sampling_location_text',
    'topic_adv',
    'matrix_adv',
    'matrix_text',
    'process_state_adv',
    'sampling_reason_adv',
    'sampling_reason_text',
    'operations_mode_adv',
    'operations_mode_text',
    'vvvo',
    'comment'
];

class ExcelToJsonService {

    // tslint:disable-next-line:no-any
    async convertExcelToJSJson(file: string): Promise<any> {
        let data: SampleData[];
        let nrl: string = '';
        try {
            const workbook: WorkBook = readFile(file);
            const worksheetName: string = workbook.SheetNames[0];
            const sampleSheet: WorkSheet = workbook.Sheets[worksheetName];
            data = this.fromWorksheetToData(sampleSheet);
            nrl = this.getNRLFromWorkSheet(sampleSheet);

            return {
                data: data,
                meta: {
                    nrl
                }
            };

        } catch (err) {
            throw new Error('Ein Fehler ist aufgetreten beim einlesen der Datei.');
        }
    }

    private getNRLFromWorkSheet(workSheet: WorkSheet): string {
        const workSheetNRL: string = workSheet['B7'].v || '';
        let nrl = '';

        switch (workSheetNRL.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
                nrl = 'NRL-Vibrio';
                break;

            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
                nrl = 'NRL-VTEC';
                break;

            case 'Bacillus spp.':
            case 'Clostridium spp. (C. difficile)':
                nrl = 'Sporenbildner';
                break;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
                nrl = 'NRL-Staph';
                break;

            case 'NRL Salmonellen(Durchführung von Analysen und Tests auf Zoonosen)':
                nrl = 'NRL-Salm';
                break;
            case 'NRL Listeria monocytogenes':
                nrl = 'NRL-Listeria';
                break;
            case 'NRL Campylobacter':
                nrl = 'NRL-Campy';
                break;
            case 'NRL Antibiotikaresistenz':
                nrl = 'NRL-AR';
                break;
            case 'Yersinia':
                nrl = 'KL-Yersinia';
                break;
            default:

        }
        return nrl;
    }

    private fromWorksheetToData(workSheet: WorkSheet): SampleData[] {

        let data: AOO;
        const lineNumber: number = this.getVersionDependentLine(workSheet);
        data = utils.sheet_to_json(workSheet, {
            header: FORM_PROPERTIES,
            range: lineNumber,
            defval: '',
            raw: false
        });
        const cleanedData = this.fromDataToCleanedSamples(data);
        const formattedData = this.formatData(cleanedData);
        return formattedData;
    }

    // tslint:disable-next-line:no-any
    private formatData(data: any) {
        const formattedData = data.map(
            (sample: SampleData) => {
                for (const props in sample) {
                    if (this.isDateField(props)) {
                        sample[props] = this.parseDate(sample[props]);
                    }
                }
                return sample;
            }
        );
        return formattedData;
    }

    private parseDate(date: string) {
        let parseOptions = {
            dateFormat: 'DD.MM.YYYY'
        };
        const americanDF = /\d\d?\/\d\d?\/\d\d\d?\d?/;
        if (americanDF.test(date)) {
            parseOptions = {
                dateFormat: 'MM/DD/YYYY'
            };
        }
        try {
            const parsedDate = moment(date, parseOptions.dateFormat).locale('de').format('DD.MM.YYYY');
            if (parsedDate === 'Invalid date') {
                return date;
            }
            return parsedDate;
        } catch (e) {
            return date;
        }
    }

    private isDateField(field: string) {
        switch (field) {
            case 'sampling_date':
            case 'isolation_date':
                return true;
            default:
                return false;
        }
    }

    private getVersionDependentLine(workSheet: WorkSheet): number {
        let num = 41;
        _.find(workSheet, (o, i) => {
            if (o.v === 'Ihre Probe-nummer') {
                const h = i.replace(/\D/, '');
                num = parseInt(h, 10);
                return true;
            }
            return false;
        });
        return num;
    }

    private fromDataToCleanedSamples(data: AOO): AOO {
        const cleanedData: AOO = data
            .filter(sampleObj => (Object.keys(sampleObj)
                .map(key => sampleObj[key]))
                .filter(item => item !== '')
                .length > 0);

        return cleanedData;
    }

}

const testUrl = API_URL + ENDPOINT;

const parser = new ExcelToJsonService();

describe('Test verification endpoint: ' + ENDPOINT, () => {
    let queryArray;
    beforeAll(async () => {
        queryArray = await getDataFromFiles();
    });

    it('should give response', async () => {
        expect.assertions(queryArray.reduce((acc, current) => {
            return acc + current.data.length * 2;
        }, 0));

        const responseArray = [];
        queryArray.forEach(
            q => {
                responseArray.push(axios.post(testUrl, q)
                    .then(function (response) {
                        return response.data;
                    })
                    .catch(function (error) {
                        throw error;
                    }));
            }
        );

        await Promise.all(responseArray).then(
            dataArray => {
                dataArray.forEach(
                    d => {
                        d.forEach(element => {
                            const receivedCodes = [];
                            for (let key of Object.keys(element.errors)) {
                                receivedCodes.push(...element.errors[key].map(e => e.code));
                            }
                            let expectedCodes = [];
                            if (element.data.comment) {
                                expectedCodes = element.data.comment.split(',').map(str => parseInt(str.trim(), 10));
                            }
                            logger.info('Expected Codes: ' + expectedCodes);
                            logger.info('Received Codes: ' + receivedCodes);
                            expect(receivedCodes.length).toBe(expectedCodes.length);
                            expect(receivedCodes).toEqual(expect.arrayContaining(expectedCodes));
                        });
                    }
                );
            }
        );
    });
});

// tslint:disable-next-line:no-any
type AOO = any[];

async function getDataFromFiles() {
    const filenames: string[] = [];
    fs.readdirSync(path.join('.', DATA_DIR)).forEach(function (file) {

        file = path.join('.', DATA_DIR, file);

        if (path.extname(file) === '.xlsx') {
            filenames.push(file);
        }

    });
    logger.info(`Found ${filenames.length} datafiles in directory ${DATA_DIR}`);
    const result = await Promise.all(filenames.map(file => {
        return parser.convertExcelToJSJson(file);
    }));
    return result;
}
