import { createService, IFormValidatorService } from '../form-validation.service';
import { ISampleCollection } from '../..';
import { SampleData, Sample } from '../../domain/sample.entity';
import { ICatalogService } from '../catalog.service';
import { IAVVFormatProvider } from '../avv-format-provider.service';
import { IValidationErrorProvider } from '../validation-error-provider.service';
import { INRLSelectorProvider } from '../nrl-selector-provider.service';

jest.mock('./../../domain', () => ({
    createValidator: () => ({
        validateSample: jest.fn()
    }),
    ConstraintSet: {
        STANDARD: 'standard',
        ZOMO: 'ZoMo'
    }
}));

describe('Validate Sample Use Case', () => {
    // tslint:disable-next-line
    let mockCatalogService: ICatalogService;
    let mockAVVFormatProvider: IAVVFormatProvider;
    let mockValidationErrorProvider: IValidationErrorProvider;
    let mockNRLSelectorProvider: INRLSelectorProvider;
    let service: IFormValidatorService;

    let genericTestSampleCollection: ISampleCollection;
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    beforeEach(() => {
        mockCatalogService = {
            getCatalog: jest.fn(),
            getCatalogSearchAliases: jest.fn()
        };
        mockAVVFormatProvider = {
            getFormat: jest.fn()
        };
        mockValidationErrorProvider = {
            getError: jest.fn()
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
        const result = service.validateSamples(genericTestSampleCollection, {});
        expect(result).resolves.toEqual({
            samples: []
        }).catch(
            e => { throw e; }
        );
    });

});
