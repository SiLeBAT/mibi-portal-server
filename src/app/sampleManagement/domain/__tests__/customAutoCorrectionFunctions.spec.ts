import _ from 'lodash';
import Fuse from 'fuse.js';
import { autoCorrectAVV324 } from '../custom-auto-correction-functions';
import { CorrectionFunction } from '../../model/autocorrection.model';
import { SampleData } from '../../model/sample.model';
import { AVV324Data } from '../../model/catalog.model';
jest.mock('../../../core/application/configuration.service');

describe('Custom Auto-correction Functions', () => {
    const genericSampleData: SampleData = {
        sample_id: {
            value: '1',
            errors: [],
            correctionOffer: []
        },
        sample_id_avv: {
            value: '1-ABC',
            errors: [],
            correctionOffer: []
        },
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
        pathogen_text: {
            value: '',
            errors: [],
            correctionOffer: []
        },
        sampling_date: {
            value: '02.01.2024',
            errors: [],
            correctionOffer: []
        },
        isolation_date: {
            value: '01.03.2024',
            errors: [],
            correctionOffer: []
        },
        sampling_location_avv: {
            value: '45397|169446|',
            errors: [],
            correctionOffer: []
        },
        sampling_location_zip: {
            value: '76275',
            errors: [],
            correctionOffer: []
        },
        sampling_location_text: {
            value: 'Ettlingen, Stadt',
            errors: [],
            correctionOffer: []
        },
        animal_avv: {
            value: '2464|186528|1212-905,1334-1356,63421-1512',
            errors: [],
            correctionOffer: []
        },
        matrix_avv: {
            value: '187036|183974|8871-8874,183670-1086',
            errors: [],
            correctionOffer: []
        },
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
        sampling_reason_avv: {
            value: '22564|126366|',
            errors: [],
            correctionOffer: []
        },
        control_program_avv: {
            value: '70564|53075|',
            errors: [],
            correctionOffer: []
        },
        program_reason_text: {
            value: 'Verdachtsprobe',
            errors: [],
            correctionOffer: []
        },
        operations_mode_avv: {
            value: '10469|57619|63422-10492,63423-10563',
            errors: [],
            correctionOffer: []
        },
        operations_mode_text: {
            value: 'Inverkehrbringen; Prozessdetails - Abgeben an Endverbraucher; Verschiedene Eigenschaften zum Betrieb - Verkaufsabteilung',
            errors: [],
            correctionOffer: []
        },
        vvvo: {
            value: '',
            errors: [],
            correctionOffer: []
        },
        program_avv: {
            value: '',
            errors: [],
            correctionOffer: []
        },
        comment: {
            value: '',
            errors: [],
            correctionOffer: []
        }
    };

    describe('autoCorrectAVV324', () => {
        // tslint:disable-next-line
        let mockCatalogService: any;

        beforeEach(() => {
            let mockAVV324Entries: Partial<AVV324Data> = {
                eintraege: {
                    '10807|186333|': {
                        Text: 'Escherichia coli'
                    },
                    '11475|2965|': {
                        Text: 'Salmonella Colindale'
                    },
                    '11488|1400|': {
                        Text: 'Salmonella Dublin'
                    },
                    '66684|57386|': {
                        Text: 'Escherichia coli Carbapenemase-bildend'
                    }
                },
                textEintraege: {
                    'Escherichia coli': '10807|186333|',
                    'Salmonella Colindale': '11475|2965|',
                    'Salmonella Dublin': '11488|1400|',
                    'Escherichia coli Carbapenemase-bildend': '66684|57386|'
                },
                fuzzyEintraege: [
                    {
                        Kode: '10807|186333|',
                        Text: 'Escherichia coli'
                    },
                    {
                        Kode: '11475|2965|',
                        Text: 'Salmonella Colindale'
                    },
                    {
                        Kode: '11488|1400|',
                        Text: 'Salmonella Dublin'
                    },
                    {
                        Kode: '66684|57386|',
                        Text: 'Escherichia coli Carbapenemase-bildend'
                    }
                ]
            };

            mockCatalogService = {
                getAVVCatalog: jest.fn(() => {
                    return {
                        dump: () => mockAVV324Entries,
                        getFuzzyIndex: (options: Fuse.IFuseOptions<{}>) =>
                            new Fuse(
                                (
                                    mockAVV324Entries as AVV324Data
                                ).fuzzyEintraege,
                                options
                            ),
                        containsTextEintrag: (value: string) =>
                            value in
                            (mockAVV324Entries as AVV324Data).textEintraege,
                        isBasicCode: (kode: string) => true,
                        containsEintragWithAVVKode: (kode: string) =>
                            kode in (mockAVV324Entries as AVV324Data).eintraege,
                        getEintragWithAVVKode: (kode: string) =>
                            kode in (mockAVV324Entries as AVV324Data).eintraege
                                ? (mockAVV324Entries as AVV324Data).eintraege[
                                      kode
                                  ]
                                : undefined
                    };
                }),
                getCatalogSearchAliases: () => []
            };
        });

        it('should not attempt to correct string Escherichia coli in pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should successfully autocorrect Escherigia coli in pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_avv: {
                        value: 'Escherigia coli',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_avv',
                original: 'Escherigia coli',
                correctionOffer: [
                    'Escherichia coli',
                    'Escherichia coli Carbapenemase-bildend'
                ],
                code: 0
            });
        });

        it('should offer corrections for 66684|57386| in pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_avv: {
                        value: '66684|57386|',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_avv',
                original: '66684|57386|',
                correctionOffer: ['Escherichia coli Carbapenemase-bildend'],
                code: 88
            });
        });

        it('should successfully offer corrections for E. coli in pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_avv: {
                        value: 'E. coli',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual({
                field: 'pathogen_avv',
                original: 'E. coli',
                correctionOffer: [
                    'Escherichia coli',
                    'Salmonella Colindale',
                    'Escherichia coli Carbapenemase-bildend',
                    'Salmonella Dublin'
                ],
                code: 0
            });
        });

        it('should not attempt to correct empty string pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_avv: {
                        value: '',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });

        it('should not attempt to correct white space only pathogen_avv', () => {
            const specificSampleData = {
                ...genericSampleData,
                ...{
                    pathogen_avv: {
                        value: ' ',
                        errors: [],
                        correctionOffer: []
                    }
                }
            };

            const correctionFunction: CorrectionFunction =
                autoCorrectAVV324(mockCatalogService);

            const autoCorrection = correctionFunction(specificSampleData);
            expect(autoCorrection).toEqual(null);
        });
    });
});
