import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as config from 'config';
import axios from 'axios';
import { logger } from '../src/aspects';
import { SampleSet } from '../src/app/ports';
import { SampleSetMetaData, Sample } from '../src/app/sampleManagement/model/sample.model';
import { SampleDataContainerDTO } from '../src/ui/server/model/shared-dto.model';
import { DefaultExcelUnmarshalService } from '../src/app/sampleManagement/application/excel-unmarshal.service';
// tslint:disable: no-console
// tslint:disable: no-any
const ENDPOINT = '/v1/samples/validated';
const API_URL = config.get('application.apiUrl');
const DATA_DIR: string = 'testData';


type TestData = any;
type ServerResponse = any;

const testUrl = API_URL + ENDPOINT;

const parser = new DefaultExcelUnmarshalService();

describe('Test verification endpoint: ' + testUrl, () => {
    let queryArray: TestData[];
    beforeAll(async () => {
        queryArray = await getDataFromFiles();
        const waitTill = new Date(new Date().getTime() + 5 * 1000);
        // tslint:disable-next-line: no-empty
        while (waitTill > new Date()) { }
    });

    it('should give response', async () => {

        const responseArray: ServerResponse[] = [];
        queryArray.forEach(
            q => {
                responseArray.push(axios.put(testUrl, q)
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
                        d.order.samples.forEach((element: SampleDataContainerDTO) => {
                            const receivedCodes: number[] = [];
                            for (let key of Object.keys(element.sample)) {
                                const ary = element.sample[key].errors || [];
                                receivedCodes.push(...ary.map(e => e.code));

                            }
                            let expectedCodes: number[] = [];

                            if (element.sample.comment.value) {
                                expectedCodes = element.sample.comment.value.split(',').map((str: string) => parseInt(str.trim(), 10));
                            }

                            logger.info('Expected Codes: ' + expectedCodes);
                            logger.info('Received Codes: ' + receivedCodes);
                            console.log('Expected Codes: ' + expectedCodes);
                            console.log('Received Codes: ' + receivedCodes);
                            expect(receivedCodes.length).toBe(expectedCodes.length);
                            expect(receivedCodes).toEqual(expect.arrayContaining(expectedCodes));
                        });
                    }
                );
            }
        );
    });
});


async function getDataFromFiles(): Promise<TestData[]> {
    const filenames: string[] = [];
    fs.readdirSync(path.join('.', DATA_DIR)).forEach(function (file) {

        file = path.join('.', DATA_DIR, file);

        if (path.extname(file) === '.xlsx') {
            filenames.push(file);
        }

    });
    logger.info(`Found ${filenames.length} datafiles in directory ${DATA_DIR}`);
    const result: SampleSet[] = await Promise.all(filenames.map(file => {
        const buffer = fs.readFileSync(file);
        return parser.convertExcelToJSJson(buffer, file);
    }));
    return result.map(r => ({
        order: {
            samples: fromSampleCollectionToDTO(r.samples).map(
                dto => ({ sample: dto })
            ),
            meta: fromSampleSetMetaDataToDTO(r.meta)
        }
    }));
}

function fromSampleCollectionToDTO(
    sampleCollection: Sample[]
) {
    return sampleCollection.map((sample: Sample) =>
        sample.getAnnotatedData()
    );
}

function fromSampleSetMetaDataToDTO(
    data: SampleSetMetaData
) {
    return {
        nrl: data.nrl,
        analysis: data.analysis,
        sender: data.sender,
        urgency: data.urgency.toString()
    };
}
