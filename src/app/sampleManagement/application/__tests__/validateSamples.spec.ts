import { Container } from 'inversify';
import { mockPersistenceContainerModule } from '../../../../infrastructure/persistence/__mocks__/persistence-mock.module';
// import { genericValidationErrors } from '../../../../infrastructure/persistence/__mocks__/validation-error.repository';
import { getApplicationContainerModule } from '../../../application.module';
import { APPLICATION_TYPES } from '../../../application.types';
import { Sample, SampleData, SampleFactory } from '../../../ports';
import {
    FormValidatorService,
    // ValidationError
} from '../../model/validation.model';
import { createContainer } from './../../../../aspects/container/container';

jest.mock('./../../domain/validator.entity', () => ({
    createValidator: () => ({
        validateSample: jest.fn()
    })
}));

describe('Validate Sample Use Case', () => {
    let service: FormValidatorService;

    let genericTestSampleCollection: Sample[];
    let testSampleData: SampleData;
    let genericTestSample: Sample;
    // let validationErrors: ValidationError[];
    let container: Container | null;
    let factory: SampleFactory;
    beforeEach(() => {
        container = createContainer();
        container.load(
            getApplicationContainerModule({
                appName: 'test',
                jobRecipient: 'test',
                login: {
                    threshold: 0,
                    secondsDelay: 0
                },
                clientUrl: 'test',
                supportContact: 'test',
                jwtSecret: 'test'
            }),
            mockPersistenceContainerModule
        );
        service = container.get<FormValidatorService>(
            APPLICATION_TYPES.FormValidatorService
        );
        factory = container.get<SampleFactory>(APPLICATION_TYPES.SampleFactory);
        // validationErrors = [...genericValidationErrors];
        testSampleData = {
            sample_id: { value: '1', errors: [], correctionOffer: [] },
            sample_id_avv: { value: '1-ABC', errors: [], correctionOffer: [] },
            partial_sample_id: {
                value: '0',
                errors: [],
                correctionOffer: []
            },
            pathogen_avv: {
                value: 'Escherichia coli',
                errors: [],
                correctionOffer: []
            },
            pathogen_text: { value: '', errors: [], correctionOffer: [] },
            sampling_date: {
                value: '01.02.2023',
                errors: [],
                correctionOffer: []
            },
            isolation_date: {
                value: '01.03.2023',
                errors: [],
                correctionOffer: []
            },
            sampling_location_avv: {
                value: '45397|169446|',
                errors: [],
                correctionOffer: []
            },
            sampling_location_zip: {
                value: '10787',
                errors: [],
                correctionOffer: []
            },
            sampling_location_text: {
                value: 'Berlin',
                errors: [],
                correctionOffer: []
            },
            animal_avv: { value: '706|57678|', errors: [], correctionOffer: [] },
            matrix_avv: { value: '187036|183974|8871-8874,183670-1086', errors: [], correctionOffer: [] },
            animal_matrix_text: {
                value: 'Kot (Hygieneproben (LFGB-Bereich)); Kontakt - LM-Kontakt; Pflanze/Tier/Stoff/relevante Zutat - Schwein',
                errors: [],
                correctionOffer: []
            },
            primary_production_avv: {
                value: '',
                errors: [],
                correctionOffer: []
            },
            control_program_avv: {
                value: '70555|59517|',
                errors: [],
                correctionOffer: []
            },
            sampling_reason_avv: {
                value: '22564|126366|',
                errors: [],
                correctionOffer: []
            },
            program_reason_text: {
                value: 'Verdachtsprobe',
                errors: [],
                correctionOffer: []
            },
            operations_mode_avv: {
                value: '10469|57619|63422-10492,63423-10563|BG:FM:KM:LM:TAM:TNP:TT:Tabak:Wein',
                errors: [],
                correctionOffer: []
            },
            operations_mode_text: {
                value: 'Inverkehrbringen; Prozessdetails - Abgeben an Endverbraucher; Verschiedene Eigenschaften zum Betrieb - Verkaufsabteilung',
                errors: [],
                correctionOffer: []
            },
            vvvo: { value: '', errors: [], correctionOffer: [] },
            comment: { value: '', errors: [], correctionOffer: [] }
        };
        genericTestSample = factory.createSample(testSampleData);
        genericTestSampleCollection = [];
    });
    afterEach(() => {
        container = null;
    });

    it('should successfully complete Happy Path with empty sampleCollection', async () => {
        expect.assertions(1);
        const result = await service.validateSamples(
            genericTestSampleCollection,
            {}
        );
        expect(result).toEqual([]);
    });

    it('should successfully complete Happy Path with single entry sample collection', async () => {
        const specificTestSampleCollection = [genericTestSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should not cause error because of different sample_id', async () => {
        const specificSample = { ...testSampleData };
        specificSample.sample_id = {
            value: '2',
            errors: [],
            correctionOffer: []
        };
        const secondSample = factory.createSample(specificSample);
        const specificTestSampleCollection = [genericTestSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    it('should not cause error because of different pathogen_avv', async () => {
        const specificSample = { ...testSampleData };
        specificSample.pathogen_avv = {
            value: 'Listeria monocytogenes',
            errors: [],
            correctionOffer: []
        };
        const secondSample = factory.createSample(specificSample);
        const specificTestSampleCollection = [genericTestSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
    });

    // it('should flag an identical ID error because of identical AVV IDs', async () => {
    //     const sampleOne = { ...testSampleData };
    //     const sampleTwo = { ...testSampleData };
    //     sampleOne.sample_id = { value: '', errors: [], correctionOffer: [] };
    //     sampleTwo.sample_id = { value: '', errors: [], correctionOffer: [] };

    //     const firstSample = factory.createSample(sampleOne);
    //     const secondSample = factory.createSample(sampleTwo);

    //     const specificTestSampleCollection = [firstSample, secondSample];

    //     expect.assertions(2);
    //     const result = await service.validateSamples(
    //         specificTestSampleCollection,
    //         {}
    //     );

    //     expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
    //         validationErrors[2]
    //     );
    //     expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
    // });

    // it('should flag an identical ID error because of identical AVV IDs', async () => {
    //     const sampleOne = { ...testSampleData };
    //     const sampleTwo = { ...testSampleData };
    //     sampleOne.sample_id = { value: '5', errors: [], correctionOffer: [] };
    //     sampleTwo.sample_id = { value: '5', errors: [], correctionOffer: [] };

    //     const firstSample = factory.createSample(sampleOne);
    //     const secondSample = factory.createSample(sampleTwo);

    //     const specificTestSampleCollection = [firstSample, secondSample];

    //     expect.assertions(2);
    //     const result = await service.validateSamples(
    //         specificTestSampleCollection,
    //         {}
    //     );

    //     expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
    //         validationErrors[2]
    //     );
    //     expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
    //         validationErrors[0]
    //     );
    // });

    it('should not flag an identical ID error because of identical AVV IDs', async () => {
        const sampleOne = { ...testSampleData };
        const sampleTwo = { ...testSampleData };
        sampleOne.sample_id = { value: '5', errors: [], correctionOffer: [] };
        sampleTwo.sample_id = { value: '4', errors: [], correctionOffer: [] };

        const firstSample = factory.createSample(sampleOne);
        const secondSample = factory.createSample(sampleTwo);

        const specificTestSampleCollection = [firstSample, secondSample];

        expect.assertions(2);
        const result = await service.validateSamples(
            specificTestSampleCollection,
            {}
        );

        expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
            []
        );
        expect(result[0].getAnnotatedData()['sample_id'].errors).toEqual([]);
    });

    // it('should flag an identical ID error because of identical IDs', async () => {
    //     const sampleOne = { ...testSampleData };
    //     const sampleTwo = { ...testSampleData };
    //     sampleOne.sample_id_avv = {
    //         value: '',
    //         errors: [],
    //         correctionOffer: []
    //     };
    //     sampleTwo.sample_id_avv = {
    //         value: '',
    //         errors: [],
    //         correctionOffer: []
    //     };

    //     const firstSample = factory.createSample(sampleOne);
    //     const secondSample = factory.createSample(sampleTwo);

    //     const specificTestSampleCollection = [firstSample, secondSample];

    //     expect.assertions(2);
    //     const result = await service.validateSamples(
    //         specificTestSampleCollection,
    //         {}
    //     );

    //     expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
    //         validationErrors[0]
    //     );
    //     expect(result[0].getAnnotatedData()['sample_id_avv'].errors).toEqual(
    //         []
    //     );
    // });

    // it('should flag an identical ID error with two entry sample collection', async () => {
    //     const identicalSample = factory.createSample(testSampleData);
    //     const specificTestSampleCollection = [
    //         genericTestSample,
    //         identicalSample
    //     ];

    //     const result = await service.validateSamples(
    //         specificTestSampleCollection,
    //         {}
    //     );

    //     expect(result[0].getAnnotatedData()['sample_id'].errors[0]).toEqual(
    //         validationErrors[0]
    //     );
    //     expect(result[0].getAnnotatedData()['sample_id_avv'].errors[0]).toEqual(
    //         validationErrors[2]
    //     );
    //     expect.assertions(2);
    // });
});
