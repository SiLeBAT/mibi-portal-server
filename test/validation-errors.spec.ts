import fs from 'fs';
import path from 'path';
import { logger } from '../src/aspects';
import {
    SampleDTO,
    SampleValidationErrorDTO
} from '../src/ui/server/model/shared-dto.model';
import { Api } from './api';
import { VALIDATION_DATA_DIR } from './fixtures';
import {
    ParsedSampleSheetDTO,
    ParsedSampleSheetMetaDTO
} from './parsed-sample-sheet.model';

/**
 * MPS-167: the validation test data is plain JSON, written by hand — no excel
 * and no generated parsed sheet. Each `<name>.validation.json` holds only what
 * the test needs; see test/data/README.md.
 */
interface ValidationTestSampleDTO {
    description: string;
    /** Only the non-empty V18 columns; the rest are sent as ''. */
    sampleData: Record<string, string>;
    expectedErrorCodes: number[];
}

interface ValidationTestDTO {
    testTitle: string;
    testDescription: string;
    samples: ValidationTestSampleDTO[];
}

interface ValidationTestCase {
    file: string;
    title: string;
    index: number;
    sample: ValidationTestSampleDTO;
}

const deactivatedFiles: string[] = [];

const V18_SAMPLE_FIELDS = [
    'sample_id',
    'sample_id_avv',
    'partial_sample_id',
    'pathogen_avv',
    'pathogen_text',
    'sequence_id',
    'sequence_status',
    'sampling_date',
    'isolation_date',
    'sampling_location_avv',
    'sampling_location_zip',
    'sampling_location_text',
    'animal_avv',
    'matrix_avv',
    'animal_matrix_text',
    'additional_marks_avv',
    'control_program_avv',
    'sampling_reason_avv',
    'program_reason_text',
    'operations_mode_avv',
    'operations_mode_text',
    'vvvo',
    'program_avv',
    'comment'
];

// The sheet meta plays no part in the sample validation, so every test file
// shares this one instead of carrying its own.
const SHEET_META: Omit<ParsedSampleSheetMetaDTO, 'fileName'> = {
    nrl: 'Bitte Labor auswählen…',
    urgency: 'NORMAL',
    sender: {
        instituteName: 'Institut für Software-Entwicklung',
        department: 'Abteilung Software-Tests',
        street: 'Diedersdorfer Weg 1',
        zipCity: '12277 Berlin',
        contactPerson: 'Torsten Test',
        telephone: '030 12345678',
        email: 'abc@de.de'
    },
    analysis: {
        species: 1,
        serological: 1,
        resistance: 1,
        vaccination: 1,
        molecularTyping: 1,
        toxin: 1,
        esblAmpCCarbapenemasen: 1,
        other: 1,
        otherText: '',
        compareHuman: 1,
        compareHumanText: ''
    },
    customerRefNumber: 'AF20250722',
    signatureDate: 'Berlin, 22.07.2025',
    version: '18'
};

const testFiles = loadValidationTests(VALIDATION_DATA_DIR);
const testCases: ValidationTestCase[] = testFiles.flatMap(({ file, test }) =>
    test.samples.map((sample, index) => ({
        file,
        title: test.testTitle,
        index,
        sample
    }))
);

describe('Test validation errors', () => {
    // One validation round trip per file, keyed by file name.
    const validatedSamples = new Map<string, SampleDTO[]>();

    beforeAll(async () => {
        logger.info(`${testCases.length} samples are to be tested`);
        await Promise.all(
            testFiles.map(async ({ file, test }) => {
                const samples = await validate(file, test);
                validatedSamples.set(file, samples);
            })
        );
    }, 1000 * 60);

    it.each(testCases.map(c => [testCaseName(c), c] as const))(
        '%s',
        (_name, { file, index, sample }) => {
            const validated = validatedSamples.get(file)![index];
            const receivedCodes = getReceivedCodes(validated).sort(
                (a, b) => a - b
            );
            const expectedCodes = [...sample.expectedErrorCodes].sort(
                (a, b) => a - b
            );

            expect(receivedCodes).toEqual(expectedCodes);
        }
    );
});

function loadValidationTests(
    dataDir: string
): { file: string; test: ValidationTestDTO }[] {
    return fs
        .readdirSync(dataDir)
        .filter(file => file.endsWith('.validation.json'))
        .filter(file => {
            if (deactivatedFiles.includes(file)) {
                logger.info(`Deactivated ${file}`);
                return false;
            }
            return true;
        })
        .map(file => ({
            file,
            test: JSON.parse(
                fs.readFileSync(path.join(dataDir, file), 'utf8')
            ) as ValidationTestDTO
        }));
}

async function validate(
    file: string,
    test: ValidationTestDTO
): Promise<SampleDTO[]> {
    const parsedSampleSheet = toParsedSampleSheet(file, test);

    // Round-trip through the samples endpoint first so the samples carry the
    // server-side NRL enrichment, exactly as the client does before validating.
    const order = await Api.putSamplesParsedSheet(parsedSampleSheet);
    const response = await Api.putValidated(order);
    return response.order.sampleSet.samples;
}

function toParsedSampleSheet(
    file: string,
    test: ValidationTestDTO
): ParsedSampleSheetDTO {
    return {
        meta: { ...SHEET_META, fileName: file },
        samples: test.samples.map(({ sampleData }) => {
            const unknownFields = Object.keys(sampleData).filter(
                key => !V18_SAMPLE_FIELDS.includes(key)
            );
            if (unknownFields.length > 0) {
                throw new Error(
                    `${file}: unknown sample fields ${unknownFields.join(', ')}`
                );
            }
            return {
                data: Object.fromEntries(
                    V18_SAMPLE_FIELDS.map(key => [
                        key,
                        {
                            value: sampleData[key] ?? '',
                            errors: [],
                            correctionOffer: []
                        }
                    ])
                )
            };
        })
    };
}

function testCaseName({ file, title, index, sample }: ValidationTestCase) {
    return `${title} (${file}) sample ${index + 1}: ${sample.description}`;
}

function getReceivedCodes(sample: SampleDTO): number[] {
    const receivedCodes: number[] = [];
    for (const key of Object.keys(sample.sampleData)) {
        const ary = sample.sampleData[key].errors || [];
        receivedCodes.push(...ary.map((e: SampleValidationErrorDTO) => e.code));
    }
    return receivedCodes;
}
