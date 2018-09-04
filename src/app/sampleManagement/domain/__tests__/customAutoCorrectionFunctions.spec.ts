import * as Fuse from 'fuse.js';
import { autoCorrectPathogen, ICorrectionFunction } from '../customAutoCorrectionFunctions';
import { ISampleData, ISample } from '../sample.entity';

describe('Custom Auto-correction Functions', () => {

    describe('autoCorrectPathogen', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;
        let genericSampleData: ISampleData;
        let genericTestSample: ISample;

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
                },
                {
                    'P-Code3': 'E. coli',
                    Text1: 'Escherichia coli'
                }
            ];

            mockCatalogService = {
                getCatalog: jest.fn(() => {
                    return {
                        dump: () => mockADVEntries,
                        getFuzzyIndex: (options: Fuse.FuseOptions) => new Fuse(mockADVEntries, options)
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
                autoCorrections: [],
                getData: jest.fn(() => genericSampleData),
                pathogenId: '',
                pathogenIdAVV: '',
                setErrors: jest.fn(),
                isZoMo: jest.fn(),
                addErrorTo: jest.fn(),
                getErrors: jest.fn(),
                correctField: jest.fn()
            };
        });

        it('should successfully autocorrect Escherigia coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: 'Escherigia coli'
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'Escherigia coli',
                corrected: 'Escherichia coli'
            });
        });

        it('should successfully autocorrect 0801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: '0801014'
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '0801014',
                corrected: 'Escherichia coli Carbapenemase-bildend'
            });
        });

        it('should successfully autocorrect 0801014 in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: '801014'
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: '801014',
                corrected: 'Escherichia coli Carbapenemase-bildend'
            });
        });

        it('should successfully autocorrect E. coli in pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: 'E. coli'
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual({
                field: 'pathogen_adv',
                original: 'E. coli',
                corrected: 'Escherichia coli'
            });
        });

        it('should not attempt to correct empty string pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: ''
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct white space only pathogen_adv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_adv: ' '
                }
            };
            const specificTestSample = {
                ...genericTestSample,
                ...{
                    getData: jest.fn(() => specificSampleData)
                }
            };

            const correctionFunction: ICorrectionFunction = autoCorrectPathogen(mockCatalogService);

            const autoCorrection = correctionFunction(specificTestSample);
            expect(autoCorrection).toEqual(null);
        });

    });
});
