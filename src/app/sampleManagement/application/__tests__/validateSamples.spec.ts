import { createService, FormValidatorService } from '../form-validation.service';
import { SampleCollection } from '../..';
import { SampleData, Sample, createSample } from '../../domain/sample.entity';
import { ICatalogService } from '../catalog.service';
import { IAVVFormatProvider } from '../avv-format-provider.service';
import { ValidationErrorProvider, ValidationError } from '../validation-error-provider.service';
import { INRLSelectorProvider } from '../nrl-selector-provider.service';

jest.mock('./../../domain');

describe('Validate Sample Use Case', () => {
    // tslint:disable-next-line
    let mockCatalogService: ICatalogService;
    let mockAVVFormatProvider: IAVVFormatProvider;
    let mockValidationErrorProvider: ValidationErrorProvider;
    let mockNRLSelectorProvider: INRLSelectorProvider;
    let service: FormValidatorService;

    let genericTestSampleCollection: SampleCollection;
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    let validationError: ValidationError;
    beforeEach(() => {
        validationError = {
            code: 0,
            level: 1,
            message: 'TEST ERROR MESSAGE'
        };
        mockCatalogService = {
            getCatalog: jest.fn(),
            getCatalogSearchAliases: jest.fn()
        };
        mockAVVFormatProvider = {
            getFormat: jest.fn()
        };
        mockValidationErrorProvider = {
            getError: () => validationError
        };
        mockNRLSelectorProvider = {
            getSelectors: jest.fn()
        };
        service = createService(mockCatalogService, mockAVVFormatProvider, mockValidationErrorProvider, mockNRLSelectorProvider);
        testSampleData = {
            sample_id: '1',
            sample_id_avv: '1-ABC',
            pathogen_adv: 'Escherichia coli',
            pathogen_text: '',
            sampling_date: '01.02.2017',
            isolation_date: '01.03.2017',
            sampling_location_adv: '11000000',
            sampling_location_zip: '10787',
            sampling_location_text: 'Berlin',
            topic_adv: '01',
            matrix_adv: '063502',
            matrix_text: 'Hähnchen auch tiefgefroren',
            process_state_adv: '999',
            sampling_reason_adv: '10',
            sampling_reason_text: 'Planprobe',
            operations_mode_adv: '4010000',
            operations_mode_text: 'Lebensmitteleinzelhandel',
            vvvo: '',
            comment: ''
        };
        genericTestSample = createSample(testSampleData);
        genericTestSampleCollection = {
            samples: []
        };
    });
    it('should successfully complete Happy Path with empty sampleCollection', async () => {
        expect.assertions(1);
        const result = await service.validateSamples(genericTestSampleCollection, {});
        expect(result).toEqual({
            samples: []
        });
    });

    it('should successfully complete Happy Path with single entry sample collection', async () => {
        const specificTestSampleCollection = {
            samples: [genericTestSample]
        };
        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id']).toBe(undefined);
        expect(errors['sample_id_avv']).toBe(undefined);
    });

    it('should not cause error because of different sample_id', async () => {
        const specificSample = { ...testSampleData };
        specificSample.sample_id = '2';
        const secondSample = createSample(specificSample);
        const specificTestSampleCollection = {
            samples: [genericTestSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id']).toBe(undefined);
        expect(errors['sample_id_avv']).toBe(undefined);
    });

    it('should not cause error because of different pathogen_adv', async () => {
        const specificSample = { ...testSampleData };
        specificSample.pathogen_adv = 'Listeria monocytogenes';
        const secondSample = createSample(specificSample);
        const specificTestSampleCollection = {
            samples: [genericTestSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id']).toBe(undefined);
        expect(errors['sample_id_avv']).toBe(undefined);
    });

    it('should flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = '';
        sampleTwo.sample_id = '';

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = {
            samples: [firstSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id_avv'][0]).toEqual(validationError);
        expect(errors['sample_id']).toBe(undefined);
    });

    it('should flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = '5';
        sampleTwo.sample_id = '5';

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = {
            samples: [firstSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id_avv'][0]).toEqual(validationError);
        expect(errors['sample_id'][0]).toEqual(validationError);
    });

    it('should not flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = '5';
        sampleTwo.sample_id = '4';

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = {
            samples: [firstSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id_avv']).toBe(undefined);
        expect(errors['sample_id']).toBe(undefined);
    });

    it('should flag an identical ID error because of identical IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id_avv = '';
        sampleTwo.sample_id_avv = '';

        const firstSample = createSample(sampleOne);
        const secondSample = createSample(sampleTwo);

        const specificTestSampleCollection = {
            samples: [firstSample, secondSample]
        };

        expect.assertions(2);
        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id'][0]).toEqual(validationError);
        expect(errors['sample_id_avv']).toBe(undefined);
    });

    it('should flag an identical ID error with two entry sample collection', async () => {
        const identicalSample = createSample(testSampleData);
        const specificTestSampleCollection = {
            samples: [genericTestSample, identicalSample]
        };

        const result = await service.validateSamples(specificTestSampleCollection, {});
        const errors = result.samples[0].getErrors();

        expect(errors['sample_id'][0]).toEqual(validationError);
        expect(errors['sample_id_avv'][0]).toEqual(validationError);
        expect.assertions(2);
    });

});
