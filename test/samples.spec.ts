import fs from 'fs';
import { promisify } from 'util';
import { Api } from './api';
import { DATA_DIR, loadParsedSheet, matchGolden } from './fixtures';
import { PutSamplesJSONRequestDTO } from '../src/ui/server/model/request.model';

const MPS155 = 'mps155_timezone_bug_v18';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mps155ValidatedJSON: PutSamplesJSONRequestDTO = require(`./data/${MPS155}_validated.json`);

describe('Test samples endpoint', () => {
    // MPS-312: the browser parses the .xlsx and PUTs JSON; the endpoint then runs the
    // server-side NRL enrichment and returns the resulting order. The old variant of
    // this test uploaded the raw .xlsx, which the controller now rejects outright.
    it('should turn a parsed sample sheet into an order', async () => {
        expect.assertions(1);

        const parsedSampleSheet = loadParsedSheet(`${MPS155}.parsedsheet.json`);

        const response = await Api.putSamplesParsedSheet(parsedSampleSheet);

        // Golden-file comparison. Regenerate with UPDATE_FIXTURES=1 after an
        // intentional change to the enrichment or the sheet — see test/data/README.md.
        expect(response).toEqual(matchGolden(`${MPS155}.order.json`, response));
    });

    it('should keep the sampling date stable across the timezone boundary (MPS-155)', async () => {
        expect.assertions(2);

        const parsedSampleSheet = loadParsedSheet(`${MPS155}.parsedsheet.json`);

        const response = await Api.putSamplesParsedSheet(parsedSampleSheet);

        // The source cells are 2018-12-31T23:00:00Z / 2019-01-01T23:00:00Z; a UTC
        // slip would render these as 31.12.2018 / 01.01.2019.
        const [first] = response.order.sampleSet.samples;
        expect(first.sampleData.sampling_date.value).toEqual('01.01.2019');
        expect(first.sampleData.isolation_date.value).toEqual('02.01.2019');
    });

    it('should convert json to excel', async () => {
        expect.assertions(4);

        const response = await Api.putSamplesJSON(mps155ValidatedJSON);

        let fileName: string = mps155ValidatedJSON.order.sampleSet.meta
            .fileName as string;
        fileName = fileName.split('.')[0];
        expect(response.fileName).toMatch(
            new RegExp('^' + fileName + '\\.MP_[0-9]{10}\\.xlsx$')
        );
        expect(response.type).toEqual(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        const buf = Buffer.from(response.data, 'base64');

        // A .xlsx is a zip archive: check the magic bytes rather than a CRC32 of the
        // whole file. The byte-exact comparison this replaces broke on every template
        // or library change without telling anyone what had actually changed.
        expect(buf.subarray(0, 2).toString('binary')).toEqual('PK');
        expect(buf.length).toBeGreaterThan(1024);
    });

    it('should reject a raw excel upload', async () => {
        expect.assertions(1);

        // MPS-312 removed the multipart path; make sure it stays removed.
        const xlsx = await promisify(fs.readFile)(DATA_DIR + `${MPS155}.xlsx`);
        const response = await Api.freeRequest(
            Api.SAMPLES_ENDPOINT,
            'PUT',
            {
                'content-type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            },
            xlsx
        );

        expect(response.status).toEqual(400);
    });
});
