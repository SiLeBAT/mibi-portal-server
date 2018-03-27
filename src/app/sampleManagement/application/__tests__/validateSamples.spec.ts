import { createService, IFormValidatorService } from './../formValidation.service';
import { ISampleCollection } from '../..';
import { ISampleData, ISample } from '../../domain/sample.entity';

jest.mock('./../../domain', () => ({
    createValidator: () => ({
        validateSample: jest.fn()
    })
}));

describe('Validate Sample Use Case', () => {
    // tslint:disable-next-line
    let mockCatalogService: any;
    let service: IFormValidatorService;

    let genericTestSampleCollection: ISampleCollection;
    let testSampleData: ISampleData;
    let genericTestSample: ISample;
    beforeEach(() => {
        mockCatalogService = {
            getCatalog: jest.fn()
        };

        service = createService(mockCatalogService);
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
        genericTestSample = {
            getData: jest.fn(),
            pathogenId: '',
            pathogenIdAVV: '',
            setErrors: jest.fn(),
            isZoMo: jest.fn(),
            addErrorTo: jest.fn(),
            getErrors: jest.fn()
        };
        genericTestSampleCollection = {
            samples: []
        };
    });
    it('should successfully complete Happy Path', () => {
        const result = service.validateSamples(genericTestSampleCollection);
        expect(result).toEqual({
            samples: []
        });
    });
    it('should call setError on testsample twice', () => {
        const mockSetErrors = jest.fn();
        const testSample = {
            ...genericTestSample, ...{
                setErrors: mockSetErrors
            }
        };
        const testSampleCollection = {
            samples: [testSample, testSample]
        };
        service.validateSamples(testSampleCollection);
        expect(mockSetErrors.mock.calls.length).toBe(2);
    });
});
