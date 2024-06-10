import fs from 'fs';
import _ from 'lodash';
import { promisify } from 'util';
var mps155JSON = require('./data/mps155_timezone_bug_v17.json');
var mps155ValidatedJSON = require('./data/mps155_timezone_bug_v17_validated.json');
import { Api } from './api';
import CRC32 from 'crc-32';

const DATA_DIR: string = 'test/data/';

describe('Test samples endpoint', () => {
    it('should convert excel to json', async () => {
        expect.assertions(1);

        const MPS155 = 'mps155_timezone_bug_v17.xlsx';
        const mps155XLSX = await promisify(fs.readFile)(
            DATA_DIR + MPS155
        );

        const response = await Api.putSamplesXLSX(mps155XLSX, MPS155);

        expect(response).toEqual(mps155JSON);
    });

    it('should convert json to excel', async () => {
        expect.assertions(3);

        const response = await Api.putSamplesJSON(mps155ValidatedJSON);

        let fileName: string = mps155ValidatedJSON.order.sampleSet.meta.fileName;
        fileName = fileName.split('.')[0];
        expect(response.fileName).toMatch(new RegExp('^' + fileName + '\\.MP_[0-9]{10}\\.xlsx$'));

        expect(response.type).toEqual('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buf = Buffer.from(response.data, 'base64');

        const mps155ValidatedXLSX = await promisify(fs.readFile)(
            DATA_DIR + 'mps155_timezone_bug_v17_validated.xlsx'
        );
        expect(CRC32.buf(buf)).toEqual(CRC32.buf(mps155ValidatedXLSX));
    });
});
