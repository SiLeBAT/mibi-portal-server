import { DefaultSample } from './../src/app/sampleManagement/domain/sample.entity';
import { Urgency, NRL_ID } from './../src/app/sampleManagement/domain/enums';
import { SampleData } from './../src/app/sampleManagement/model/sample.model';
import { PutValidatedRequestDTO } from '../src/ui/server/model/request.model';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import { logger } from '../src/aspects';
import { SampleSet } from '../src/app/ports';
import { SampleSetMetaData, Sample, SampleMetaData } from '../src/app/sampleManagement/model/sample.model';
import { DefaultExcelUnmarshalService } from '../src/app/sampleManagement/application/excel-unmarshal.service';
import { SampleDTO, SampleMetaDTO, SampleValidationErrorDTO } from '../src/ui/server/model/shared-dto.model';
import { Api } from './api';
import { promisify } from 'util';
import { EMPTY_META } from '../src/app/sampleManagement/domain/constants';
import { getMockNRLService } from '../src/app/sampleManagement/application/__mocks__/nrl.service';

const DATA_DIR: string = 'testData/validation';


const factory = {
    createSample(data: SampleData): Sample {
        return DefaultSample.create(
            data,
            {
                nrl: NRL_ID.NRL_AR,
                analysis: {},
                urgency: Urgency.NORMAL
            },
            getMockNRLService()
        );
    }
}
const parser = new DefaultExcelUnmarshalService(factory);

describe('Test validation errors', () => {
    it('should give correct error codes', async () => {
        const fileNames = await getFilesToTest();
        const requests = await Promise.all(fileNames.map((fileName) => getRequestDTOFromFile(fileName)));

        let count = 0;
        requests.map(req => count += req.order.sampleSet.samples.length);
        expect.assertions(count);

        return Promise.all(requests.map(async (request) => {
            const response = await Api.putValidated(request);

            response.order.sampleSet.samples.forEach((sample: SampleDTO, index) => {
                const receivedCodes = getReceivedCodes(sample).sort((a, b) => a - b);
                const expectedCodes = getExpectedCodes(sample).sort((a, b) => a - b);

                const meta = {
                    sample: index + 1,
                    file: request.order.sampleSet.meta.fileName
                }

                expect({ ...meta, codes: receivedCodes }).toEqual({ ...meta, codes: expectedCodes });
            });
        }))
    }, 1000 * 120);
});

async function getFilesToTest(): Promise<string[]> {
    let fileNames: string[] = [];
    fs.readdirSync(path.join('.', DATA_DIR)).forEach(function (file) {

        file = path.join('.', DATA_DIR, file);

        if (path.extname(file) === '.xlsx') {
            fileNames.push(file);
        }

    });
    logger.info(`Found ${fileNames.length} datafiles in directory ${DATA_DIR}`);
    return fileNames;
}

async function getRequestDTOFromFile(fileName: string): Promise<PutValidatedRequestDTO> {
    const file: Buffer = await promisify(fs.readFile)(fileName);
    const sampleSet: SampleSet = await parser.convertExcelToJSJson(file, fileName);

    return {
        order: {
            sampleSet: {
                samples: fromSampleCollectionToSampleDTO(sampleSet.samples),
                meta: fromSampleSetMetaDataToDTO(sampleSet.meta)
            }
        }
    };
}

function fromSampleCollectionToSampleDTO(
    sampleCollection: Sample[]
): SampleDTO[] {
    return sampleCollection.map((sample: Sample) => ({
        sampleData: sample.getAnnotatedData(),
        sampleMeta: fromSampleMetaToDTO({
            nrl: sample.getNRL(),
            urgency: sample.getUrgency(),
            analysis: sample.getAnalysis()
        })
    }));
}

function fromSampleMetaToDTO(meta: SampleMetaData): SampleMetaDTO {
    return {
        nrl: meta.nrl.toString(),
        urgency: meta.urgency.toString(),
        analysis: { ...EMPTY_META.analysis, ...meta.analysis }
    };
}
function fromSampleSetMetaDataToDTO(
    data: SampleSetMetaData
) {
    return {
        sender: data.sender,
        fileName: data.fileName
    };
}

function getReceivedCodes(sample: SampleDTO): number[] {
    const receivedCodes: number[] = [];
    for (let key of Object.keys(sample.sampleData)) {
        const ary = sample.sampleData[key].errors || [];
        receivedCodes.push(...ary.map((e: SampleValidationErrorDTO) => e.code));
    }
    return receivedCodes;
}

function getExpectedCodes(sample: SampleDTO): number[] {
    let expectedCodes: number[] = [];
    if (sample.sampleData.comment.value) {
        expectedCodes = sample.sampleData.comment.value.split(',').map((str: string) => parseInt(str.trim(), 10));
    }
    return expectedCodes;
}