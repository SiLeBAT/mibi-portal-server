
import { PutValidatedResponseDTO } from './../src/ui/server/model/response.model';
import { PutValidatedRequestDTO } from './../src/ui/server/model/request.model';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as config from 'config';
import axios from 'axios-https-proxy-fix';
import { logger } from '../src/aspects';
import { SampleSet } from '../src/app/ports';
import { SampleSetMetaData, Sample, SampleMetaData } from '../src/app/sampleManagement/model/sample.model';
import { DefaultExcelUnmarshalService } from '../src/app/sampleManagement/application/excel-unmarshal.service';
import { SampleDTO, SampleMetaDTO } from '../src/ui/server/model/shared-dto.model';

interface SampleValidationErrorDTO {
    code: number;
    level: number;
    message: string;
}

// tslint:disable: no-console
const ENDPOINT = '/v1/samples/validated';
const API_URL = config.get('application.apiUrl');
const DATA_DIR: string = 'testData/validation';

const testUrl = API_URL + ENDPOINT;

const parser = new DefaultExcelUnmarshalService();

const axiosconfig = {
    proxy:
        { host: 'webproxy.bfr.bund.de', port: 8080 }
};

describe('Test verification endpoint: ' + testUrl, () => {
    let queryArray: PutValidatedRequestDTO[];
    beforeAll(async () => {
        queryArray = await getDataFromFiles();
        const waitTill = new Date(new Date().getTime() + 5 * 1000);
        // tslint:disable-next-line: no-empty
        while (waitTill > new Date()) { }
    });

    it('should give response', async () => {

        const responseArray: Promise<PutValidatedResponseDTO>[] = [];
        queryArray.forEach(
            q => {
                responseArray.push(axios.put(testUrl, q, axiosconfig)
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
                        d.order.sampleSet.samples.forEach((element: SampleDTO) => {
                            const receivedCodes: number[] = [];
                            for (let key of Object.keys(element.sampleData)) {
                                const ary = element.sampleData[key].errors || [];
                                receivedCodes.push(...ary.map((e: SampleValidationErrorDTO) => e.code));

                            }
                            let expectedCodes: number[] = [];

                            if (element.sampleData.comment.value) {
                                expectedCodes = element.sampleData.comment.value.split(',').map((str: string) => parseInt(str.trim(), 10));
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


async function getDataFromFiles(): Promise<PutValidatedRequestDTO[]> {
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
            sampleSet: {
                samples: fromSampleCollectionToSampleDTO(r.samples),
                meta: fromSampleSetMetaDataToDTO(r.meta)
            }
        }
    }));
}

function fromSampleCollectionToSampleDTO(
    sampleCollection: Sample[]
): SampleDTO[] {
    return sampleCollection.map((sample: Sample) => ({
        sampleData: sample.getAnnotatedData(),
        sampleMeta: fromSampleMetaToDTO(sample.getSampleMetaData())
    }));
}

function fromSampleMetaToDTO(meta: SampleMetaData): SampleMetaDTO {
    return {
        nrl: meta.nrl.toString()
    };
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
