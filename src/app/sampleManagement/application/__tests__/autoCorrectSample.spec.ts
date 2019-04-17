import { createService } from '../form-auto-correction.service';
import { FormAutoCorrectionService } from '../../model/autocorrection.model';
import { SampleData, SampleCollection, Sample } from '../../model/sample.model';
import { ValidationErrorProvider } from '../../model/validation.model';
jest.mock('../../../core/application/configuration.service');

describe('Auto-correct Sample Use Case', () => {
    // tslint:disable-next-line
    let mockCatalogService: any;
    let service: FormAutoCorrectionService;

    let genericTestSampleCollection: SampleCollection;
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    let mockValidationErrorProvider: ValidationErrorProvider;
    beforeEach(() => {
        mockCatalogService = {
            getCatalog: jest.fn(() => {
                return {
                    dump: () => jest.fn,
                    getFuzzyIndex: jest.fn
                };
            }),
            getCatalogSearchAliases: jest.fn(() => [])
        };
        mockValidationErrorProvider = {
            getError: jest.fn()
        };

        service = createService(
            mockCatalogService,
            mockValidationErrorProvider
        );
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
            correctionSuggestions: [],
            edits: {},
            getData: jest.fn(),
            pathogenId: '',
            pathogenIdAVV: '',
            setErrors: jest.fn(),
            addErrors: jest.fn(),
            isZoMo: jest.fn(),
            addErrorTo: jest.fn(),
            getErrors: jest.fn(),
            correctField: jest.fn(),
            clone: jest.fn()
        };
        genericTestSampleCollection = {
            samples: []
        };
    });
    it('should successfully complete Happy Path', () => {
        const result = service.applyAutoCorrection(genericTestSampleCollection);

        expect(result)
            .resolves.toEqual({
                samples: []
            })
            .catch(e => {
                throw e;
            });
    });
});
