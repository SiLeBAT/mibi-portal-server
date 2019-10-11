import * as fs from 'fs';
import * as _ from 'lodash';
import * as config from 'config';
import { logger } from '../src/aspects';
import { promisify } from 'util';
import { addMulterSingleFileFormToMockRequest } from '../src/ui/server/controllers/__mocks__/multer.mock';
import { request, RequestOptions } from 'http';
var FormData = require('form-data');
var mps155JSON = require('../testData/mps155_timezone_bug.json');
import * as rp from 'request-promise-native';

// tslint:disable: no-console
const ENDPOINT = '/v1/samples';
const API_URL = config.get('application.apiUrl');
const DATA_DIR: string = 'testData/';

// const testUrl = API_URL + ENDPOINT;
const testUrl = API_URL + ENDPOINT;

const options = {
    url: testUrl,
    json: true,
    proxy: 'http://localhost:3000',
    headers: {
        'accept': 'application/json',
    }
}

describe('Test samples endpoint: ' + testUrl, () => {
    xit('should convert excel to json', async () => {
        const MPS155 = 'mps155_timezone_bug.xlsx';
        const mps155XLSX = await promisify(fs.readFile)(
            DATA_DIR + MPS155
        );

        let reqMock: any;
        reqMock = addMulterSingleFileFormToMockRequest(
            {},
            'file',
            mps155XLSX,
            MPS155
        );

        const formData = {
            file: {
                value: mps155XLSX,
                options: {
                    filename: MPS155
                }
            }
        }

        // expect.assertions(1);

        const res: any = await rp.put({...options, formData: formData});
        console.log(res);

        // let options: RequestOptions = {
        //     method: 'PUT',
        //     // url: 'http://localhost:3000/v1/samples',
        //     hostname: 'localhost',
        //     port: 3000,
        //     path: '/v1/samples',
        //     headers: {
        //         'accept': 'application/json',
        //         'content-type': 'multipart/form-data'
        //     }
        // };

        // const req = request(options, (res) => {
        //     expect(res.statusCode).toBe(200);
        //     console.log(res.statusCode);
        // });

        // req.on('error', (e) => {
        //     console.error(e);
        // });
        // req.write(
        //     mps155XLSX
        // );
        // req.end();


        // expect(res.data).toEqual(mps155JSON);
    });

    // xit('should convert json to excel', async () => {
    //     container.unbind(APPLICATION_TYPES.FileRepository);
    //     container.bind(PERSISTENCE_TYPES.DataDir).toConstantValue('./data');
    //     container
    //         .bind<FileRepository>(APPLICATION_TYPES.FileRepository)
    //         .to(DefaultFileRepository);
    //     controller = container.get<SamplesController>(
    //         SERVER_TYPES.SamplesController
    //     );

    //     expect.assertions(3);

    //     let req = new mockReq({
    //         method: 'PUT',
    //         headers: {
    //             accept: 'multipart/form-data',
    //             'content-type': 'application/json'
    //         },
    //         body: mps155ValidatedJSON
    //     });
    //     let res = new mockRes();
    //     await controller.putSamples(req, res);

    //     expect(res.statusCode).toBe(200);
    //     const body = res._getJSON();
    //     expect(body).toHaveProperty('data');
    //     const buf = Buffer.from(body.data, 'base64');
    //     const mps155ValidatedXLSX = await promisify(fs.readFile)(
    //         'testData/mps155_timezone_bug_validated.xlsx'
    //     );
    //     expect(CRC32.buf(buf)).toEqual(CRC32.buf(mps155ValidatedXLSX));

    //     container.unbind(PERSISTENCE_TYPES.DataDir);
    //     container.unbind(APPLICATION_TYPES.FileRepository);
    //     container.unload(mockPersistenceContainerModule);
    //     container.load(mockPersistenceContainerModule);
    //     controller = container.get<SamplesController>(
    //         SERVER_TYPES.SamplesController
    //     );
    // });
});