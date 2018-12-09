import * as _ from 'lodash';
import * as Fuse from 'fuse.js';
import { autoCorrectADV16, CorrectionFunction, autoCorrectADV8, autoCorrectADV9, autoCorrectADV3, autoCorrectADV12, autoCorrectADV2 } from '../custom-auto-correction-functions';
import { SampleData, Sample } from '../sample.entity';

describe('Custom Auto-correction Functions', () => {

    describe('autoCorrectADV16', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '0801001',
                    'P-Code3': 'Escherichia coli',
                    Text1: 'Escherichia coli'
                },
                {
                    Kode: '0803326',
                    'P-Code3': 'S.Colindale',
                    Text1: 'Salmonella Colindale'
                },
                {
                    Kode: '0803502',
                    'P-Code3': 'S.Dublin',
                    Text1: 'Salmonella Dublin'
                },
                {
                    Kode: '0801014',
                    'P-Code3': '',
                    Text1: 'Escherichia coli Carbapenemase-bildend'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        containsUniqueEntryWithId: (v: string) => !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getUniqueEntryWithId: (v: string) => _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct string Escherichia coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should successfully autocorrect Escherigia coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: 'Escherigia coli'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'Escherigia coli',
                correctionOffer: ['Escherichia coli', 'Escherichia coli Carbapenemase-bildend'],
                code: 0
            });
        });

        it('should offer corrections for 801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: '801014'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '801014',
                correctionOffer: ['Escherichia coli Carbapenemase-bildend'],
                code: 87
            });
        });

        it('should offer corrections for 0801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: '0801014'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '0801014',
                correctionOffer: ['Escherichia coli Carbapenemase-bildend'],
                code: 87
            });
        });

        it('should successfully offer corrections for E. coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: 'E. coli'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'E. coli',
                correctionOffer: ['Escherichia coli', 'Salmonella Colindale', 'Escherichia coli Carbapenemase-bildend', 'Salmonella Dublin'],
                code: 0
            });
        });

        it('should not attempt to correct empty string pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct white space only pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: ' '
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV16(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

    });

    describe('autoCorrectADV8', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '4000000'
                },
                {
                    Kode: '4010000'
                },
                {
                    Kode: '4010100'
                },
                {
                    Kode: '4010110'
                },
                {
                    Kode: '4010120'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        containsUniqueEntryWithId: (v: string) => !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getUniqueEntryWithId: (v: string) => _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct correct string 4010000 operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct incorrect string 40xxxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: '40xxxxx'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 4010xxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: '4010xxx'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 90, 'correctionOffer': ['4010000'], 'field': 'operations_mode_adv', 'original': '4010xxx' });
        });

        it('should attempt to correct incorrect string 401xxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: '401xxxx'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 90, 'correctionOffer': ['4010000'], 'field': 'operations_mode_adv', 'original': '401xxxx' });
        });

        it('should attempt to correct incorrect string 4xxxxxx operations_mode_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    operations_mode_adv: '4xxxxxx'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV8(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 90, 'correctionOffer': ['4000000'], 'field': 'operations_mode_adv', 'original': '4xxxxxx' });
        });

    });

    describe('autoCorrectADV9', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '11000000'
                },
                {
                    Kode: '01051032'
                },
                {
                    Kode: '11000'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        containsUniqueEntryWithId: (v: string) => !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getUniqueEntryWithId: (v: string) => _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct correct string 11000000 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct string 01051032 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: '01051032'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 1051032 sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: '1051032'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 89, 'correctionOffer': ['01051032'], 'field': 'sampling_location_adv', 'original': '1051032' });
        });

        it('should attempt to correct incorrect string 11000xxx sampling_location_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    sampling_location_adv: '11000xxx'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV9(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 89, 'correctionOffer': ['11000'], 'field': 'sampling_location_adv', 'original': '11000xxx' });
        });

    });

    describe('autoCorrectADV3', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '063502'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        containsUniqueEntryWithId: (v: string) => !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getUniqueEntryWithId: (v: string) => _.filter(mockADVEntries, e => e['Kode'] === v)[0]
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct correct string 063502 matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    matrix_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 63502 matrix_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    matrix_adv: '63502'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV3(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 91, 'correctionOffer': ['063502'], 'field': 'matrix_adv', 'original': '63502' });
        });

    });

    describe('autoCorrectADV12', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '046',
                    Text1: 'Kaltgeräuchert'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        containsUniqueEntryWithId: (v: string) => !!_.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getUniqueEntryWithId: (v: string) => _.filter(mockADVEntries, e => e['Kode'] === v)[0],
                        // @ts-ignore
                        getEntriesWithKeyValue: (k: string, v: string) => _.filter(mockADVEntries, e => e[k] === v)
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
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
                process_state_adv: '046',
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct correct string 046 process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct empty string process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct incorrect string 46 process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: '46'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 92, 'correctionOffer': ['046'], 'field': 'process_state_adv', 'original': '46' });
        });

        it('should attempt to correct incorrect string Kaltgeräuchert process_state_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    process_state_adv: 'Kaltgeräuchert'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV12(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 92, 'correctionOffer': ['046'], 'field': 'process_state_adv', 'original': 'Kaltgeräuchert' });
        });
    });

    describe('autoCorrectADV2', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: SampleData;
        let genericTestSample: Sample;

        beforeEach(() => {
            let mockADVEntries = [
                {
                    Kode: '020302',
                    Kodiersystem: '01'
                },
                {
                    Kode: '020302',
                    Kodiersystem: '15'
                },
                {
                    Kode: '001014',
                    Kodiersystem: '15'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options),
                        // @ts-ignore
                        containsEntryWithKeyValue: (k: string, v: string) => !!_.filter(mockADVEntries, e => e[k] === v)[0],
                        // @ts-ignore
                        getEntriesWithKeyValue: (k: string, v: string) => _.filter(mockADVEntries, e => e[k] === v)
                    };
                }),
                getCatalogSearchAliases: () => []
            };
            genericSampleData = {
                sample_id: '1',
                sample_id_avv: '1-ABC',
                pathogen_adv: 'Escherichia coli',
                pathogen_text: '',
                sampling_date: '01.02.2017',
                isolation_date: '01.03.2017',
                sampling_location_adv: '11000000',
                sampling_location_zip: '10787',
                sampling_location_text: 'Berlin',
                topic_adv: '15',
                matrix_adv: '001014',
                matrix_text: 'Hähnchen auch tiefgefroren',
                process_state_adv: '046',
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
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                addErrors: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn(),
                clone: jest.fn()
            };
        });

        it('should not attempt to correct correct string 046 topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should attempt to correct empty string topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    topic_adv: ''
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 93, 'correctionOffer': ['15'], 'field': 'topic_adv', 'original': '' });
        });

        it('should correct topic 01 topic_adv to 15', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    topic_adv: '01',
                    matrix_adv: '001014'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({ 'code': 93, 'correctionOffer': ['15'], 'field': 'topic_adv', 'original': '01' });
        });

        it('should not correct topic 01 topic_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    topic_adv: '01',
                    matrix_adv: '020302'
                }
            };

            const correctionFunction: CorrectionFunction = autoCorrectADV2(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });
    });
});
