import moment from 'moment';
import _ from 'lodash';
import {
    referenceDate,
    atLeastOneOf,
    dependentFields,
    // registeredZoMo,
    // shouldBeZoMo,
    // inCatalog,
    // matchADVNumberOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear,
    // requiredIfOther
} from '../custom-validator-functions';
import {
    ValidationError,
    // MatchADVNumberOrStringOptions
} from './../../model/validation.model';
// import { CatalogService, Catalog } from '../../model/catalog.model';
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
            sample_id: '1',
            sample_id_avv: '17-L-00412-1-1',
            pathogen_avv: 'Escherichia coli',
            pathogen_text: '',
            sampling_date: '01.02.2023',
            isolation_date: '01.03.2023',
            sampling_location_avv: '45397|169446|',
            sampling_location_zip: '10787',
            sampling_location_text: 'Berlin',
            animal_avv: '706|57678|',
            matrix_avv: '187036|183974|8871-8874,183670-1086',
            animal_matrix_text: 'Kot (Hygieneproben (LFGB-Bereich)); Kontakt - LM-Kontakt; Pflanze/Tier/Stoff/relevante Zutat - Schwein',
            primary_production_avv: '',
            sampling_reason_avv: '22564|126366|',
            program_reason_text: 'Verdachtsprobe',
            operations_mode_avv: '10469|57619|63422-10492,63423-10563|BG:FM:KM:LM:TAM:TNP:TT:Tabak:Wein',
            operations_mode_text: 'Inverkehrbringen; Prozessdetails - Abgeben an Endverbraucher; Verschiedene Eigenschaften zum Betrieb - Verkaufsabteilung',
            vvvo: '',
            comment: ''
        };
    });

    // describe('requiredIfOther', () => {
    //     it('should validate without errors', () => {
    //         const error = requiredIfOther(
    //             testSample.primary_production_avv,
    //             {
    //                 message: validationError,
    //                 field: 'operations_mode_avv',
    //                 regex: '^4'
    //             },
    //             'primary_production_avv',
    //             testSample
    //         );
    //         expect(error).toBe(null);
    //     });

    //     it('should validate without errors', () => {
    //         const error = requiredIfOther(
    //             testSample.primary_production_avv,
    //             {
    //                 message: validationError,
    //                 field: 'operations_mode_avv',
    //                 regex: '^1'
    //             },
    //             'primary_production_avv',
    //             testSample
    //         );
    //         expect(error).toBe(null);
    //     });

    //     it('should fail validation with error message', () => {
    //         const differentSample = {
    //             ...testSample,
    //             ...{ primary_production_avv: '' }
    //         };
    //         const error = requiredIfOther(
    //             differentSample.primary_production_avv,
    //             {
    //                 message: validationError,
    //                 field: 'operations_mode_avv',
    //                 regex: '^4'
    //             },
    //             'primary_production_avv',
    //             differentSample
    //         );
    //         expect(error).toEqual(validationError);
    //     });

    //     it('should validate without errors', () => {
    //         const differentSample = {
    //             ...testSample,
    //             ...{ primary_production_avv: '' }
    //         };
    //         const error = requiredIfOther(
    //             differentSample.primary_production_avv,
    //             {
    //                 message: validationError,
    //                 field: 'operations_mode_avv',
    //                 regex: '^1'
    //             },
    //             'primary_production_avv',
    //             differentSample
    //         );
    //         expect(error).toBe(null);
    //     });
    // });

    describe('atLeastOneOf', () => {
        it('should validate without errors because sampling_reason_avv & program_reason_text present', () => {
            const error = atLeastOneOf(
                testSample.sampling_reason_avv,
                {
                    message: validationError,
                    additionalMembers: ['program_reason_text']
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should validate without errors because sampling_reason_avv present', () => {
            const error = atLeastOneOf(
                testSample.sampling_reason_avv,
                {
                    message: validationError,
                    additionalMembers: ['comment']
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });

        it('should fail validation with error message because vvvo & comment absent', () => {
            const error = atLeastOneOf(
                testSample.vvvo,
                {
                    message: validationError,
                    additionalMembers: ['comment']
                },
                'vvvo',
                testSample
            );
            expect(error).toEqual(validationError);
        });
        it('should fail validation with error message because vvvo, comment & pathogen_text absent', () => {
            const error = atLeastOneOf(
                testSample.vvvo,
                {
                    message: validationError,
                    additionalMembers: ['comment', 'pathogen_text']
                },
                'vvvo',
                testSample
            );
            expect(error).toEqual(validationError);
        });
        it('should validate without errors because sampling_reason_avv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['sampling_reason_avv']
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });
        it('should validate without errors because sampling_reason_avv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['sampling_reason_avv', 'pathogen_text']
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
        });
        it('should validate without errors because sampling_reason_avv present', () => {
            const error = atLeastOneOf(
                testSample.comment,
                {
                    message: validationError,
                    additionalMembers: ['pathogen_text', 'sampling_reason_avv']
                },
                'sampling_reason_avv',
                testSample
            );
            expect(error).toBe(null);
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

    // describe('inCatalog', () => {
    //     // tslint:disable-next-line
    //     let mockCatalog: Catalog<any>;
    //     let mockCatalogService: CatalogService;

    //     beforeEach(() => {
    //         mockCatalog = {
    //             getEntriesWithKeyValue: (key: string, value: string) => [],
    //             getUniqueEntryWithId: (id: string) => ({}),
    //             containsUniqueEntryWithId: (id: string) => true,
    //             containsEntryWithKeyValue: (key: string, value: string) => true,
    //             hasUniqueId: () => true,
    //             getUniqueId: () => '',
    //             getFuzzyIndex: jest.fn(),
    //             dump: () => []
    //         };
    //         mockCatalogService = {
    //             getCatalog: () => mockCatalog,
    //             getCatalogSearchAliases: jest.fn()
    //         };
    //     });

    //     it('should validate without errors', () => {
    //         const error = inCatalog(mockCatalogService)(
    //             testSample.matrix_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv3',
    //                 key: 'Kode'
    //             },
    //             'matrix_avv',
    //             testSample
    //         );
    //         expect(error).toBe(null);
    //     });

    //     it('should not validate because entry 62 is not in ADV12', () => {
    //         testSample.primary_production_avv = '62';
    //         mockCatalog.containsEntryWithKeyValue = (
    //             key: string,
    //             value: string
    //         ) => false;
    //         const error = inCatalog(mockCatalogService)(
    //             testSample.primary_production_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv12',
    //                 key: 'Kode'
    //             },
    //             'primary_production_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(validationError);
    //     });
    // });

    // describe('matchADVNumberOrString', () => {
    //     // tslint:disable-next-line
    //     let mockCatalog: Catalog<any>;
    //     let mockCatalogService: CatalogService;

    //     beforeEach(() => {
    //         // tslint:disable-next-line
    //         mockCatalog = {
    //             getEntriesWithKeyValue: (key: string, value: string) => [],
    //             getUniqueEntryWithId: (id: string) => ({}),
    //             containsUniqueEntryWithId: (id: string) => true,
    //             containsEntryWithKeyValue: (key: string, value: string) => {
    //                 switch (value) {
    //                     case '1234567':
    //                         return true;
    //                     case 'Escherichia coli':
    //                         return true;
    //                     default:
    //                         return false;
    //                 }
    //             },
    //             hasUniqueId: () => true,
    //             getUniqueId: () => '',
    //             getFuzzyIndex: jest.fn(),
    //             dump: () => []
    //         };

    //         mockCatalogService = {
    //             getCatalog: () => mockCatalog,
    //             getCatalogSearchAliases: jest.fn()
    //         };
    //     });

    //     it('should validate without errors', () => {
    //         testSample.pathogen_avv = '';
    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toBe(null);
    //     });

    //     it('should not validate because entry 62 is not in ADV16', () => {
    //         testSample.pathogen_avv = '62';

    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(validationError);
    //     });

    //     it('should validate because entry 1234567 is in ADV16', () => {
    //         testSample.pathogen_avv = '1234567';

    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(null);
    //     });

    //     it('should validate because entry 1234567 is in ADV16 and value is trimmed', () => {
    //         testSample.pathogen_avv = '    1234567    ';

    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(null);
    //     });

    //     it('should validate because entry Escherichia coli is in ADV16 and value is trimmed', () => {
    //         testSample.pathogen_avv = '    Escherichia coli    ';

    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(null);
    //     });

    //     it('should not validate because entry 1234  567 contains spaces', () => {
    //         testSample.pathogen_avv = '1234  567';

    //         const error = matchADVNumberOrString(mockCatalogService)(
    //             testSample.pathogen_avv,
    //             {
    //                 message: validationError,
    //                 catalog: 'adv16',
    //                 key: 'Kode',
    //                 alternateKeys: ['Text']
    //             } as MatchADVNumberOrStringOptions,
    //             'pathogen_avv',
    //             testSample
    //         );
    //         expect(error).toEqual(validationError);
    //     });
    // });

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
});
