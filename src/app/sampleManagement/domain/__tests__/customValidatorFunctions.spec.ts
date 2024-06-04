import moment from 'moment';
import _ from 'lodash';
import {
    referenceDate,
    atLeastOneOf,
    dependentFields,
    // registeredZoMo,
    // shouldBeZoMo,
    inCatalog,
    inAVVCatalog,
    inAVVFacettenCatalog,
    nrlExists,
    dateAllowEmpty,
    noPlanprobeForNRL_AR,
    matchADVNumberOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear,
    requiredIfOther,
    matchAVVCodeOrString
} from '../custom-validator-functions';
import {
    ValidationError,
    MatchADVNumberOrStringOptions,
    MatchAVVCodeOrStringOptions
} from './../../model/validation.model';
import { CatalogService, Catalog, AVVCatalog } from '../../model/catalog.model';
jest.mock('../../../ports');

moment.locale('de');

describe('Custom Validator Functions', () => {
    let testSample: Record<string, string>;
    let validationError: ValidationError;

    beforeEach(() => {
        validationError = {
            code: 0,
            level: 1,
            message: 'TEST ERROR MESSAGE'
        };

        testSample = {
            nrl: 'NRL-AR',
            sample_id: '1',
            sample_id_avv: '17-L-00412-1-1',
            partial_sample_id: '0',
            pathogen_avv: 'Escherichia coli',
            pathogen_text: '',
            sampling_date: '02.01.2024',
            isolation_date: '03.03.2024',
            sampling_location_avv: '42342|175490|',
            sampling_location_zip: '',
            sampling_location_text: 'Ettlingen, Stadt',
            animal_avv: '2464|186528|1212-905,1334-1356,63421-1512',
            matrix_avv: '187036|183974|8871-8874,183670-1086',
            animal_matrix_text: '',
            primary_production_avv: '59138|50593|',
            control_program_avv: '',
            sampling_reason_avv: '22562|126354|',
            program_reason_text: 'Planprobe',
            operations_mode_avv: '10469|57619|63422-10492,63423-10563',
            operations_mode_text:
                'Inverkehrbringen; Prozessdetails - Abgeben an Endverbraucher; Verschiedene Eigenschaften zum Betrieb - Verkaufsabteilung',
            vvvo: '12345678765432',
            program_avv: '186294|157177|',
            comment: ''
        };
    });

    describe('requiredIfOther', () => {
        it('should validate without errors', () => {
            const error = requiredIfOther(
                testSample.sampling_location_text,
                {
                    message: validationError,
                    field: 'sampling_location_zip',
                    regex: '\\S'
                },
                'sampling_location_text',
                testSample
            );

            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const error = requiredIfOther(
                testSample.sampling_location_zip,
                {
                    message: validationError,
                    field: 'sampling_location_text',
                    regex: '\\S'
                },
                'sampling_location_zip',
                testSample
            );

            expect(error).toEqual(validationError);
        });

        it('should validate without errors', () => {
            const differentSample = {
                ...testSample,
                ...{ sampling_location_zip: '76275' }
            };

            const error = requiredIfOther(
                differentSample.sampling_location_zip,
                {
                    message: validationError,
                    field: 'sampling_location_text',
                    regex: '\\S'
                },
                'sampling_location_zip',
                differentSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_location_zip: '76275',
                    sampling_location_text: ''
                }
            };
            const error = requiredIfOther(
                differentSample.sampling_location_text,
                {
                    message: validationError,
                    field: 'sampling_location_zip',
                    regex: '\\S'
                },
                'sampling_location_text',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_location_zip: '76275',
                    sampling_location_text: ''
                }
            };
            const error = requiredIfOther(
                differentSample.sampling_location_zip,
                {
                    message: validationError,
                    field: 'sampling_location_text',
                    regex: '\\S'
                },
                'sampling_location_zip',
                differentSample
            );
            expect(error).toBe(null);
        });
    });

    describe('atLeastOneOf', () => {
        it('should validate without errors because animal_avv & matrix_avv present', () => {
            const error = atLeastOneOf(
                testSample.animal_avv,
                {
                    message: validationError,
                    additionalMembers: ['matrix_avv', 'animal_matrix_text']
                },
                'animal_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because animal_avv present', () => {
            const differentSample = {
                ...testSample,
                ...{
                    animal_avv: '2464|186528|1212-905,1334-1356,63421-1512',
                    matrix_avv: '',
                    animal_matrix_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.animal_avv,
                {
                    message: validationError,
                    additionalMembers: ['matrix_avv', 'animal_matrix_text']
                },
                'animal_avv',
                differentSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because animal_avv & matrix_avv & animal_matrix_text absent', () => {
            const differentSample = {
                ...testSample,
                ...{
                    animal_avv: '',
                    matrix_avv: '',
                    animal_matrix_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.animal_avv,
                {
                    message: validationError,
                    additionalMembers: ['matrix_avv', 'animal_matrix_text']
                },
                'animal_avv',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors because sampling_reason_avv & program_reason_text present', () => {
            const error = atLeastOneOf(
                testSample.sampling_reason_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'control_programm_avv',
                        'program_reason_text'
                    ]
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because sampling_reason_avv present', () => {
            const differentSample = {
                ...testSample,
                ...{
                    control_program_avv: '',
                    sampling_reason_avv: '22562|126354|',
                    program_reason_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_reason_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'control_programm_avv',
                        'program_reason_text'
                    ]
                },
                'sampling_reason_avv',
                differentSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because control_program_avv & sampling_reason_avv & program_reason_text absent', () => {
            const differentSample = {
                ...testSample,
                ...{
                    control_program_avv: '',
                    sampling_reason_avv: '',
                    program_reason_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_reason_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'control_program_avv',
                        'program_reason_text'
                    ]
                },
                'sampling_reason_avv',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors because sampling_location_avv & sampling_location_text present', () => {
            const error = atLeastOneOf(
                testSample.sampling_location_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'sampling_location_zip',
                        'sampling_location_text'
                    ]
                },
                'sampling_location_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because sampling_location_avv present', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_location_avv: '42342|175490|',
                    sampling_location_zip: '',
                    sampling_location_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_location_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'sampling_location_zip',
                        'sampling_location_text'
                    ]
                },
                'sampling_location_avv',
                differentSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because sampling_location_avv & sampling_location_zip & sampling_locatio_text absent', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_location_avv: '',
                    sampling_location_zip: '',
                    sampling_location_text: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_location_avv,
                {
                    message: validationError,
                    additionalMembers: [
                        'sampling_location_zip',
                        'sampling_location_text'
                    ]
                },
                'sampling_location_avv',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors because sampling_id present', () => {
            const error = atLeastOneOf(
                testSample.sampling_id,
                {
                    message: validationError,
                    additionalMembers: ['sampling_id_avv']
                },
                'sampling_id',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because sampling_id & sampling_id_avv absent', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_id: '',
                    sampling_id_avv: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_id,
                {
                    message: validationError,
                    additionalMembers: ['sampling_id_avv']
                },
                'sampling_id',
                differentSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors because sampling_date present', () => {
            const error = atLeastOneOf(
                testSample.sampling_date,
                {
                    message: validationError,
                    additionalMembers: ['isolation_date']
                },
                'sampling_date',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because sampling_date & isolation_date absent', () => {
            const differentSample = {
                ...testSample,
                ...{
                    sampling_date: '',
                    isolation_date: ''
                }
            };
            const error = atLeastOneOf(
                differentSample.sampling_date,
                {
                    message: validationError,
                    additionalMembers: ['isolation_date']
                },
                'sampling_date',
                differentSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('referenceDate', () => {
        describe('latest', () => {
            it('should validate because Isolation happened on same day as sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.02.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should validate because isolation happened after sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.03.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should not validate because Isolation happened before sampling', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.01.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.sampling_date,
                    {
                        message: validationError,
                        latest: 'isolation_date'
                    },
                    'sampling_date',
                    oldSample
                );
                expect(error).toEqual(validationError);
            });
        });

        describe('earliest', () => {
            it('should validate because sampling happened before isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.03.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should validate because sampling happened on same day as isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.02.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toBe(null);
            });

            it('should not validate because sampling happened after isolation', () => {
                const oldSample = {
                    ...testSample,
                    ...{
                        sampling_date: '01.02.2016',
                        isolation_date: '01.01.2016'
                    }
                };

                const error = referenceDate(
                    oldSample.isolation_date,
                    {
                        message: validationError,
                        earliest: 'sampling_date'
                    },
                    'isolation_date',
                    oldSample
                );
                expect(error).toEqual(validationError);
            });
        });

        it('should not validate', () => {
            const oldSample = {
                ...testSample,
                ...{
                    sampling_date: '01.02.2016',
                    isolation_date: '01.03.2017'
                }
            };

            const error = referenceDate(
                oldSample.sampling_date,
                {
                    message: validationError,
                    earliest: 'isolation_date',
                    modifier: {
                        value: 1,
                        unit: 'year'
                    }
                },
                'sampling_date',
                oldSample
            );
            expect(error).toEqual(validationError);
        });

        it('should not validate', () => {
            const oldSample = {
                ...testSample,
                ...{
                    sampling_date: '14.11.2006',
                    isolation_date: '15.11.2016'
                }
            };

            const error = referenceDate(
                oldSample.sampling_date,
                {
                    message: validationError,
                    earliest: 'NOW',
                    modifier: {
                        value: 10,
                        unit: 'year'
                    }
                },
                'sampling_date',
                oldSample
            );
            expect(error).toEqual(validationError);
        });
    });

    // dependentFields works but is not used in validation constraints
    describe('dependentFields', () => {
        it('should validate without errors', () => {
            const error = dependentFields(
                testSample.sampling_location_zip,
                {
                    message: validationError,
                    dependents: ['sampling_location_text']
                },
                'sampling_location_zip',
                testSample
            );
            expect(error).toBe(null);
        });
    });

    describe('inCatalog (ADV)', () => {
        // tslint:disable-next-line
        let mockCatalog: Catalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            mockCatalog = {
                getEntriesWithKeyValue: (key: string, value: string) => [],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };
            mockCatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn(),
                getAVVCatalog: jest.fn()
            };
        });

        it('should validate without errors', () => {
            const error = inCatalog(mockCatalogService)(
                testSample.sampling_location_zip,
                {
                    message: validationError,
                    catalog: 'plz',
                    key: 'Kode'
                },
                'sampling_location_zip',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 12345 is not in plz', () => {
            testSample.sampling_location_zip = '12345';
            mockCatalog.containsEntryWithKeyValue = (
                key: string,
                value: string
            ) => false;
            const error = inCatalog(mockCatalogService)(
                testSample.sampling_location_zip,
                {
                    message: validationError,
                    catalog: 'plz',
                    key: 'Kode'
                },
                'sampling_location_zip',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('inAVVCatalog', () => {
        // tslint:disable-next-line
        let mockCatalog: AVVCatalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            mockCatalog = {
                containsEintragWithAVVKode: (kode: string) => true,
                containsTextEintrag: (value: string) => true,
                getEintragWithAVVKode: jest.fn(),
                getAVV313EintragWithAVVKode: jest.fn(),
                getAttributeWithAVVKode: jest.fn(),
                containsFacetteWithBegriffsId: jest.fn(),
                getFacettenIdsWithKode: jest.fn(),
                getFacetteWithBegriffsId: jest.fn(),
                getFacettenWertWithBegriffsId: jest.fn(),
                assembleAVVKode: jest.fn(),
                getTextWithAVVKode: jest.fn(),
                hasFacettenInfo: jest.fn(),
                isBasicCode: jest.fn(),
                getTextWithFacettenCode: jest.fn(),
                getFuzzyIndex: jest.fn(),
                getUniqueId: () => '',
                dump: () => ({})
            };

            mockCatalogService = {
                getCatalog: jest.fn(),
                getCatalogSearchAliases: jest.fn(),
                getAVVCatalog: () => mockCatalog
            };
        });

        it('should validate without errors', () => {
            const error = inAVVCatalog(mockCatalogService)(
                testSample.sampling_location_avv,
                {
                    message: validationError,
                    catalog: 'avv313',
                    key: 'Kode'
                },
                'sampling_location_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 1234|56789| is not in plz', () => {
            testSample.sampling_location_avv = '1234|56789|';
            mockCatalog.containsEintragWithAVVKode = (value: string) => false;
            mockCatalog.containsTextEintrag = (value: string) => false;
            const error = inAVVCatalog(mockCatalogService)(
                testSample.sampling_location_avv,
                {
                    message: validationError,
                    catalog: 'avv313',
                    key: 'Kode'
                },
                'sampling_location_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('inAVVFacettenCatalog', () => {
        // tslint:disable-next-line
        let mockCatalog: AVVCatalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            mockCatalog = {
                containsEintragWithAVVKode: (kode: string) => true,
                containsTextEintrag: jest.fn(),
                getEintragWithAVVKode: jest.fn(),
                getAVV313EintragWithAVVKode: jest.fn(),
                getAttributeWithAVVKode: jest.fn(),
                containsFacetteWithBegriffsId: jest.fn(),
                getFacettenIdsWithKode: (kode: string) => [0],
                getFacetteWithBegriffsId: (begriffsId: string) =>
                    ({
                        FacettenId: 0
                    } as any),
                getFacettenWertWithBegriffsId: (
                    facettenWertId: string,
                    facettenBegriffsId: string
                ) => ({} as any),
                assembleAVVKode: jest.fn(),
                getTextWithAVVKode: jest.fn(),
                hasFacettenInfo: (kode: string) => true,
                isBasicCode: (kode: string) => false,
                getTextWithFacettenCode: jest.fn(),
                getFuzzyIndex: jest.fn(),
                getUniqueId: () => '',
                dump: () => ({})
            };

            mockCatalogService = {
                getCatalog: jest.fn(),
                getCatalogSearchAliases: jest.fn(),
                getAVVCatalog: () => mockCatalog
            };
        });

        it('should validate without errors', () => {
            // matrix_avv: '187036|183974|8871-8874,183670-1086
            const error = inAVVFacettenCatalog(mockCatalogService)(
                testSample.matrix_avv,
                {
                    message: validationError,
                    catalog: 'avv319',
                    key: 'Kode'
                },
                'matrix_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because 187036|183974|12345-8874,183670-1086 has wrong facettenId', () => {
            testSample.matrix_avv =
                '187036|183974|12345-8874,183670-1086 has wrong facettenId';
            mockCatalog.getFacetteWithBegriffsId = (begriffsId: string) =>
                ({
                    FacettenId: 1
                } as any);

            const error = inAVVFacettenCatalog(mockCatalogService)(
                testSample.matrix_avv,
                {
                    message: validationError,
                    catalog: 'avv319',
                    key: 'Kode'
                },
                'matrix_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });

        it('should not validate beccause entry 187036|183974 is lacking the final pipe character', () => {
            testSample.matrix_avv = '187036|183974';
            mockCatalog.hasFacettenInfo = (kode: string) => false;
            const error = inAVVFacettenCatalog(mockCatalogService)(
                testSample.matrix_avv,
                {
                    message: validationError,
                    catalog: 'avv319',
                    key: 'Kode'
                },
                'matrix_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate without errors because 187036|183974| is a valid AVV matrix code ', () => {
            testSample.matrix_avv = '187036|183974|';
            mockCatalog.isBasicCode = (kode: string) => true;
            mockCatalog.hasFacettenInfo = (kode: string) => false;
            const error = inAVVFacettenCatalog(mockCatalogService)(
                testSample.matrix_avv,
                {
                    message: validationError,
                    catalog: 'avv319',
                    key: 'Kode'
                },
                'matrix_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 1234|56789| is not a valid AVV matrix code', () => {
            testSample.matrix_avv = '1234|56789|';
            mockCatalog.isBasicCode = (kode: string) => true;
            mockCatalog.hasFacettenInfo = (kode: string) => false;
            mockCatalog.containsEintragWithAVVKode = (value: string) => false;
            const error = inAVVFacettenCatalog(mockCatalogService)(
                testSample.matrix_avv,
                {
                    message: validationError,
                    catalog: 'avv319',
                    key: 'Kode'
                },
                'matrix_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('nrlExists', () => {
        it('should validate without errors', () => {
            const error = nrlExists(
                testSample.pathogen_avv,
                {
                    message: validationError
                },
                'pathogen_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because NRL is unknown', () => {
            testSample.nrl = 'Labor nicht erkannt';
            const error = nrlExists(
                testSample.pathogen_avv,
                {
                    message: validationError
                },
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('dateAllowEmpty', () => {
        it('should validate without errors', () => {
            const error = dateAllowEmpty(
                testSample.sampling_date,
                {
                    message: validationError
                } as any,
                'samplingDate',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            testSample.sampling_date = '';
            const error = dateAllowEmpty(
                testSample.sampling_date,
                {
                    message: validationError
                } as any,
                'samplingDate',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because of wrong date format', () => {
            testSample.sampling_date = '01-01-2024';
            const error = dateAllowEmpty(
                testSample.sampling_date,
                {
                    message: validationError
                } as any,
                'samplingDate',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('noPlanprobeForNRL_AR', () => {
        it('should validate without errors because it is a ZoMo sample', () => {
            testSample.control_program_avv = '70564|53075|';
            const error = noPlanprobeForNRL_AR(
                testSample.sampling_reason_avv,
                {
                    message: validationError
                } as any,
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because it is not a Planprobe', () => {
            testSample.sampling_reason_avv = '12345|67890|';
            const error = noPlanprobeForNRL_AR(
                testSample.sampling_reason_avv,
                {
                    message: validationError
                } as any,
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because it is a Planprobe', () => {
            const error = noPlanprobeForNRL_AR(
                testSample.sampling_reason_avv,
                {
                    message: validationError
                } as any,
                'sampling_reason_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    // works but is not used in validation constraints
    describe('matchADVNumberOrString', () => {
        // tslint:disable-next-line
        let mockCatalog: Catalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            // tslint:disable-next-line
            mockCatalog = {
                getEntriesWithKeyValue: (key: string, value: string) => [],
                getUniqueEntryWithId: (id: string) => ({}),
                containsUniqueEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => {
                    switch (value) {
                        case '1234567':
                            return true;
                        case 'Escherichia coli':
                            return true;
                        default:
                            return false;
                    }
                },
                hasUniqueId: () => true,
                getUniqueId: () => '',
                getFuzzyIndex: jest.fn(),
                dump: () => []
            };

            mockCatalogService = {
                getCatalog: () => mockCatalog,
                getCatalogSearchAliases: jest.fn(),
                getAVVCatalog: jest.fn()
            };
        });

        it('should validate without errors', () => {
            testSample.pathogen_avv = '';
            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 62 is not in ADV16', () => {
            testSample.pathogen_avv = '62';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate because entry 1234567 is in ADV16', () => {
            testSample.pathogen_avv = '1234567';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry 1234567 is in ADV16 and value is trimmed', () => {
            testSample.pathogen_avv = '    1234567    ';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry Escherichia coli is in ADV16 and value is trimmed', () => {
            testSample.pathogen_avv = '    Escherichia coli    ';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should not validate because entry 1234  567 contains spaces', () => {
            testSample.pathogen_avv = '1234  567';

            const error = matchADVNumberOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'adv16',
                    key: 'Kode',
                    alternateKeys: ['Text']
                } as MatchADVNumberOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('matchAVVCodeOrString', () => {
        // tslint:disable-next-line
        let mockCatalog: AVVCatalog<any>;
        let mockCatalogService: CatalogService;

        beforeEach(() => {
            // tslint:disable-next-line
            mockCatalog = {
                containsEintragWithAVVKode: (kode: string) => {
                    switch (kode) {
                        case '10807|186333|':
                            return true;
                        default:
                            return false;
                    }
                },
                containsTextEintrag: (value: string) => {
                    switch (value) {
                        case 'Escherichia coli':
                            return true;
                        default:
                            return false;
                    }
                },
                getEintragWithAVVKode: jest.fn(),
                getAVV313EintragWithAVVKode: jest.fn(),
                getAttributeWithAVVKode: jest.fn(),
                containsFacetteWithBegriffsId: jest.fn(),
                getFacettenIdsWithKode: jest.fn(),
                getFacetteWithBegriffsId: jest.fn(),
                getFacettenWertWithBegriffsId: jest.fn(),
                assembleAVVKode: jest.fn(),
                getTextWithAVVKode: jest.fn(),
                hasFacettenInfo: jest.fn(),
                isBasicCode: jest.fn(),
                getTextWithFacettenCode: jest.fn(),
                getFuzzyIndex: jest.fn(),
                getUniqueId: () => '',
                dump: () => ({})
            };

            mockCatalogService = {
                getCatalog: jest.fn(),
                getCatalogSearchAliases: jest.fn(),
                getAVVCatalog: () => mockCatalog
            };
        });

        it('should validate without errors', () => {
            testSample.pathogen_avv = '';
            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should not validate because entry 1234|56789| is not in AVV324', () => {
            testSample.pathogen_avv = '1234|56789|';

            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });

        it('should validate because entry 10807|186333| is in AVV324', () => {
            testSample.pathogen_avv = '10807|186333|';

            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry 10807|186333| is in AVV324 and value is trimmed', () => {
            testSample.pathogen_avv = '    10807|186333|    ';

            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should validate because entry Escherichia coli is in AVV324 and value is trimmed', () => {
            testSample.pathogen_avv = '    Escherichia coli    ';

            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(null);
        });

        it('should not validate because entry 1234  567 contains spaces', () => {
            testSample.pathogen_avv = '1234  567';

            const error = matchAVVCodeOrString(mockCatalogService)(
                testSample.pathogen_avv,
                {
                    message: validationError,
                    catalog: 'avv324',
                    key: 'Kode',
                    alternateKey: 'Text'
                } as MatchAVVCodeOrStringOptions,
                'pathogen_avv',
                testSample
            );
            expect(error).toEqual(validationError);
        });
    });

    // works and is used by matchesIdToSpecificYear
    describe('matchesRegexPattern', () => {
        it('should validate without errors', () => {
            const error = matchesRegexPattern(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: false
                },
                'sample_id_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate list without errors', () => {
            const stateFormats: { [key: string]: string[] } = {
                BW: ['^17[0-9]{7}$', '^17/[0-9]{5}[.-][0-9]$'],
                BY: ['^17-[0-9]{7}-[0-9]{3}$', '^17-[0-9]{7}$'],
                BE: [
                    '^17-(W|TW|CMO|T|UKF)-[0-9]{1,4}$',
                    '^17[0-9]{5}(MK|T|CMO|TK)( *)[0-9]{1,4}$'
                ],
                BB: [
                    '^17-(UKF|T|FA|W|CMO)-[0-9]{2,4}$',
                    '^17[0-9]{5}(MK|UKF|UWF|MI|T|CMO|L|MM)( *)[0-9]{1,4}$'
                ],
                HB: ['^[0-9]{5,7}17[0-9]{4,5}$'],
                HH: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                HE: ['^17[0-9]{7}$'],
                MV: ['^17[A-Za-z]{2,4}[0-9]{4}-[0-9]{2,3}$'],
                NI: ['^[0-9]{4,5}17[0-9]{4,6}$'],
                NW: [
                    '^2017-[0-9]{7}$',
                    '^2017(MEL|OWL|RRW|WFL)[0-9]{6}$',
                    '^[0-9]{5}$',
                    '^(D)[0-9]{2,4}$',
                    '^(D)[0-9]{3,4}-[0-9]{2,4}$',
                    '^(K)( *)[0-9]{3,4}$',
                    '^(D)( *)[0-9]{4}-[0-9]{2,4}$'
                ],
                RP: ['^2017-[0-9]{8}$'],
                SL: ['^L-2017-[0-9]{5}$'],
                ST: ['^17[0-9]{9}$', '^[0-9]{3}-[0-9]{2}-[0-9]{3}-17$'],
                SH: ['^[NF]17[0-9]{6}-[0-9]{3}$'],
                SN: [
                    '^L/2017/[0-9]{5,6}$',
                    '^V[L|D]-2017/[0-9]{5}$',
                    '^17(B|L)[0-9]{3}$'
                ],
                TH: ['^B-2017/[0-9]{4,5}$', '^[0-9]{4,5}17$']
            };

            const data = require('./AVVExamples.json');

            _.forEach(data, (exampleAVVs: string[], state: string) => {
                exampleAVVs.forEach(avv => {
                    _.forEach(stateFormats, (regex: string[], st: string) => {
                        const error = matchesRegexPattern(
                            avv,
                            {
                                message: validationError,
                                regex: regex,
                                ignoreNumbers: false
                            },
                            'sample_id_avv',
                            testSample
                        );
                        if (state === st) {
                            expect(error).toBe(null);
                        }
                    });
                });
            });
        });

        it('should validate without errors because it ignores numbers', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '121111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: true
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should give validation error because it does not ignore numbers', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '121111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: false
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });

        it('should give validation error because this is not a number', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = 'A21111112';
            const error = matchesRegexPattern(
                mySample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^17-[LF]-[0-9]{5}-[0-9]-[0-9]$'],
                    ignoreNumbers: true
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });
    });

    describe('matchesIdToSpecificYear', () => {
        it('should validate without errors because it is the correct date', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2017';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because it is 1 year in the past', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2016';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because it is 1 year in the future', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2018';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toBe(null);
        });

        it('should give validation errors because it is 2 year in the past', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2015';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });

        it('should give validation errors because it is 2 year in the future', () => {
            const mySample = { ...testSample };
            mySample.sample_id_avv = '17-L-12345-3-2';
            mySample.sampling_date = '24.12.2019';
            const error = matchesIdToSpecificYear(
                testSample.sample_id_avv,
                {
                    message: validationError,
                    regex: ['^yy-[LF]-[0-9]{5}-[0-9]-[0-9]$']
                },
                'sample_id_avv',
                mySample
            );
            expect(error).toEqual(validationError);
        });
    });

    // describe('registeredZoMo', () => {
    //     it('should validate without errors', () => {
    //         const zoMoSample: Record<string, string> = {
    //             ...testSample,
    //             ...{
    //                 sampling_date: '01.02.2023',
    //                 isolation_date: '01.03.2023',
    //                 sampling_reason_avv: '70564|53075|',
    //                 program_reason_text: '',
    //                 operations_mode_avv: '62726|57604|2-1566,1473-1002,63421-1511|LM:Wein',
    //                 matrix_avv: '187036|183974|8871-8874,183670-1086',
    //                 animal_avv: '706|57678|'
    //             }
    //         };

    //         const fakeAdv16Entry = {
    //             Kodiersystem: '000',
    //             Kode: '0801001',
    //             Text: 'Escherichia coli',
    //         };

    //         const fakeAVV324Entry = {
    //             "10807|1548|": {
    //                 "Text": "Escherichia coli"
    //             },
    //         };

    //         const fakeZspDump = {
    //             "ADV8-Kode": [
    //               '1000000'
    //             ],
    //             "ADV3-Kode": [
    //               '522011'
    //             ],
    //             "ADV16-Kode": [
    //               '0801001'
    //             ],
    //             Kodiersystem: [
    //               "15",
    //             ],
    //           }

    //         // tslint:disable-next-line
    //         const mockCatalog: Catalog<any> = {
    //             getEntriesWithKeyValue: (key: string, value: string) => [
    //                 fakeAdv16Entry
    //             ],
    //             getUniqueEntryWithId: (id: string) => ({}),
    //             containsUniqueEntryWithId: (id: string) => true,
    //             containsEntryWithKeyValue: (key: string, value: string) => true,
    //             hasUniqueId: () => true,
    //             getUniqueId: () => '',
    //             getFuzzyIndex: jest.fn(),
    //             dump: () => [
    //                 fakeZspDump
    //             ]
    //         };

    //         const mockAVVCatalog: AVVCatalog<any> = {

    //             containsEintragWithAVVKode: (kode: string) => true,
    //             containsTextEintrag: (value: string) => true,
    //             getEintragWithAVVKode: (kode: string) => fakeAVV324Entry['10807|1548|'],
    //             getAttributeWithAVVKode: (kode: string) => [],
    //             containsFacetteWithBegriffsId: (begriffsId: string) => true,
    //             getFacettenIdsWithKode: (kode: string) => [],
    //             getFacetteWithBegriffsId: (begriffsId: string) => ({})

    //             // getEntriesWithKeyValue: (key: string, value: string) => [
    //             //     fakeAdv16Entry
    //             // ],
    //             // getUniqueEntryWithId: (id: string) => ({}),
    //             // containsUniqueEntryWithId: (id: string) => true,
    //             // containsEntryWithKeyValue: (key: string, value: string) => true,
    //             // hasUniqueId: () => true,
    //             getUniqueId: () => '',
    //             getFuzzyIndex: jest.fn(),
    //             dump: () => [
    //                 fakeZspDump
    //             ]
    //         };

    //         //
    //         //
    //         // getFacettenWertWithBegriffsId(facettenWertId: string, facettenBegriffsId: string): MibiFacettenWert | undefined;
    //         // assembleAVVKode(begriffsIdEintrag: string, id: string): string;
    //         // getFuzzyIndex(options: Fuse.IFuseOptions<FuzzyEintrag>, enhancements?: FuzzyEintrag[]): Fuse<FuzzyEintrag>;
    //         // getUniqueId(): string;
    //         // dump(): T;

    //         const mockCatalogService: CatalogService = {
    //             getAVVCatalog: () => mockCatalog,
    //             getCatalogSearchAliases: jest.fn()
    //         };
    //         const error = registeredZoMo(mockCatalogService)(
    //             zoMoSample.operations_mode_avv,
    //             {
    //                 message: validationError,
    //                 group: [
    //                     {
    //                         attr: 'operations_mode_avv',
    //                         code: 'ADV8-Kode'
    //                     },
    //                     {
    //                         attr: 'matrix_avv',
    //                         code: 'ADV3-Kode'
    //                     },
    //                     {
    //                         attr: 'animal_avv',
    //                         code: 'Kodiersystem'
    //                     },
    //                     {
    //                         attr: 'pathogen_avv',
    //                         code: 'ADV16-Kode'
    //                     }
    //                         ],
    //                 year: ['sampling_date', 'isolation_date'],
    //                 catalog: 'adv16'
    //             },
    //             'operations_mode_avv',
    //             zoMoSample
    //         );
    //         expect(error).toBe(null);
    //     });
    // });

    // describe('shouldBeZoMo', () => {
    //     it('should validate with error because values match with ZoMo sample', () => {
    //         const zoMoSample: Record<string, string> = {
    //             ...testSample,
    //             ...{
    //                 sampling_date: '01.02.2023',
    //                 isolation_date: '01.03.2023',
    //                 sampling_reason_avv: '10',
    //                 program_reason_text: '',
    //                 operations_mode_avv: '1000000',
    //                 matrix_avv: '522011',
    //                 animal_avv: '15'
    //             }
    //         };

    //         const fakeAdv16Entry = {
    //             Kodiersystem: '000',
    //             Kode: '0801001',
    //             Text: 'Escherichia coli',
    //         };

    //         const fakeZspDump = {
    //             "ADV8-Kode": [
    //               '1000000'
    //             ],
    //             "ADV3-Kode": [
    //               '522011'
    //             ],
    //             "ADV16-Kode": [
    //               '0801001'
    //             ],
    //             Kodiersystem: [
    //               "15",
    //             ],
    //           }

    //         // tslint:disable-next-line
    //         const mockCatalog: Catalog<any> = {
    //             getEntriesWithKeyValue: (key: string, value: string) => [
    //                 fakeAdv16Entry
    //             ],
    //             getUniqueEntryWithId: (id: string) => ({}),
    //             containsUniqueEntryWithId: (id: string) => true,
    //             containsEntryWithKeyValue: (key: string, value: string) => true,
    //             hasUniqueId: () => true,
    //             getUniqueId: () => '',
    //             getFuzzyIndex: jest.fn(),
    //             dump: () => [
    //                 fakeZspDump
    //             ]
    //         };

    //         const mockCatalogService: CatalogService = {
    //             getCatalog: () => mockCatalog,
    //             getCatalogSearchAliases: jest.fn()
    //         };
    //         const error = shouldBeZoMo(mockCatalogService)(
    //             zoMoSample.operations_mode_avv,
    //             {
    //                 message: validationError,
    //                 group: [
    //                     {
    //                         attr: 'operations_mode_avv',
    //                         code: 'ADV8-Kode'
    //                     },
    //                     {
    //                         attr: 'matrix_avv',
    //                         code: 'ADV3-Kode'
    //                     },
    //                     {
    //                         attr: 'animal_avv',
    //                         code: 'Kodiersystem'
    //                     },
    //                     {
    //                         attr: 'pathogen_avv',
    //                         code: 'ADV16-Kode'
    //                     }
    //                         ],
    //                 year: ['sampling_date', 'isolation_date'],
    //                 catalog: 'adv16'
    //             },
    //             'operations_mode_avv',
    //             zoMoSample
    //         );
    //         expect(error).not.toBe(null);
    //     });
    // });
});
