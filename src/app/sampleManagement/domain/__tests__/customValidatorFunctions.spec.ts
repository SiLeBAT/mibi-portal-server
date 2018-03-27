import * as moment from 'moment';
import { ISampleData } from './../sample.entity';
import {
    referenceDate,
    atLeastOneOf,
    dependentFieldEntry,
    inPathogenIndex,
    dependentFields,
    numbersOnly,
    registeredZoMo,
    nonUniqueEntry,
    inCatalog
} from './../customValidatorFunctions';
import { ICatalog } from '../..';
import { ICatalogService } from '../../application';
import { IValidationError } from '../validationErrorProvider.entity';

moment.locale('de');

describe('Custom Validator Functions', () => {

    let testSample: ISampleData;
    let validationError: IValidationError;

    beforeEach(() => {
        validationError = {
            id: '0',
            code: 0,
            level: 1,
            message: 'TEST ERROR MESSAGE'
        };

        testSample = {
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
    });

    describe('dependentFieldEntry', () => {
        it('should validate without errors', () => {
            const error = dependentFieldEntry(testSample.process_state_adv, {
                message: validationError,
                field: 'operations_mode_adv',
                regex: '^4'
            }, 'process_state_adv', testSample);
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            const error = dependentFieldEntry(testSample.process_state_adv, {
                message: validationError,
                field: 'operations_mode_adv',
                regex: '^1'
            }, 'process_state_adv', testSample);
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const differentSample = {
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
                process_state_adv: '',
                sampling_reason_adv: '10',
                sampling_reason_text: 'Planprobe',
                operations_mode_adv: '4010000',
                operations_mode_text: 'Lebensmitteleinzelhandel',
                vvvo: '',
                comment: ''
            };
            const error = dependentFieldEntry(differentSample.process_state_adv, {
                message: validationError,
                field: 'operations_mode_adv',
                regex: '^4'
            }, 'process_state_adv', differentSample);
            expect(error).toEqual(validationError);
        });

        it('should validate without errors', () => {
            const differentSample = {
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
                process_state_adv: '',
                sampling_reason_adv: '10',
                sampling_reason_text: 'Planprobe',
                operations_mode_adv: '4010000',
                operations_mode_text: 'Lebensmitteleinzelhandel',
                vvvo: '',
                comment: ''
            };
            const error = dependentFieldEntry(differentSample.process_state_adv, {
                message: validationError,
                field: 'operations_mode_adv',
                regex: '^1'
            }, 'process_state_adv', differentSample);
            expect(error).toBe(null);
        });

    });

    describe('atLeastOneOf', () => {
        it('should validate without errors', () => {
            const error = atLeastOneOf(testSample.sampling_reason_adv, {
                message: validationError,
                additionalMembers: ['sampling_reason_text']
            }, 'sampling_reason_adv', testSample);
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            const error = atLeastOneOf(testSample.sampling_reason_adv, {
                message: validationError,
                additionalMembers: ['comment']
            }, 'sampling_reason_adv', testSample);
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const error = atLeastOneOf(testSample.vvvo, {
                message: validationError,
                additionalMembers: ['comment']
            }, 'vvvo', testSample);
            expect(error).toEqual(validationError);
        });
    });

    describe('referenceDate', () => {

        describe('latest', () => {
            it('should validate because Isolation happened on same day as sampling', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.02.2016',
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

                const error = referenceDate(oldSample.sampling_date, {
                    message: validationError,
                    latest: 'isolation_date'
                }, 'sampling_date', oldSample);
                expect(error).toBe(null);
            });

            it('should validate because isolation happened after sampling', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.03.2016',
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

                const error = referenceDate(oldSample.sampling_date, {
                    message: validationError,
                    latest: 'isolation_date'
                }, 'sampling_date', oldSample);
                expect(error).toBe(null);
            });

            it('should not validate because Isolation happened before sampling', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.01.2016',
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

                const error = referenceDate(oldSample.sampling_date, {
                    message: validationError,
                    latest: 'isolation_date'
                }, 'sampling_date', oldSample);
                expect(error).toEqual(validationError);
            });
        });

        describe('earliest', () => {
            it('should validate because sampling happened before isolation', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.03.2016',
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

                const error = referenceDate(oldSample.isolation_date, {
                    message: validationError,
                    earliest: 'sampling_date'
                }, 'isolation_date', oldSample);
                expect(error).toBe(null);
            });

            it('should validate because sampling happened on same day as isolation', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.02.2016',
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

                const error = referenceDate(oldSample.isolation_date, {
                    message: validationError,
                    earliest: 'sampling_date'
                }, 'isolation_date', oldSample);
                expect(error).toBe(null);
            });

            it('should not validate because sampling happened after isolation', () => {
                const oldSample = {
                    sample_id: '1',
                    sample_id_avv: '1-ABC',
                    pathogen_adv: 'Escherichia coli',
                    pathogen_text: '',
                    sampling_date: '01.02.2016',
                    isolation_date: '01.01.2016',
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

                const error = referenceDate(oldSample.isolation_date, {
                    message: validationError,
                    earliest: 'sampling_date'
                }, 'isolation_date', oldSample);
                expect(error).toEqual(validationError);
            });
        });

        it('should not validate', () => {
            const oldSample = {
                sample_id: '1',
                sample_id_avv: '1-ABC',
                pathogen_adv: 'Escherichia coli',
                pathogen_text: '',
                sampling_date: '01.02.2016',
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

            const error = referenceDate(oldSample.sampling_date, {
                message: validationError,
                earliest: 'isolation_date',
                modifier: {
                    value: 1,
                    unit: 'year'
                }
            }, 'sampling_date', oldSample);
            expect(error).toEqual(validationError);
        });

        it('should not validate', () => {
            const oldSample = {
                sample_id: '1',
                sample_id_avv: '1-ABC',
                pathogen_adv: 'Escherichia coli',
                pathogen_text: '',
                sampling_date: '14.11.2006',
                isolation_date: '15.11.2016',
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

            const error = referenceDate(oldSample.sampling_date, {
                message: validationError,
                earliest: 'NOW',
                modifier: {
                    value: 10,
                    unit: 'year'
                }
            }, 'sampling_date', oldSample);
            expect(error).toEqual(validationError);
        });
    });

    describe('inPathogenIndex', () => {
        // tslint:disable-next-line
        let validationFn: any;
        beforeEach(() => {
            validationFn = inPathogenIndex({
                contains: (str: string) => {
                    switch (str) {
                        case 'Escherichiacoli':
                            return true;
                        default: return false;
                    }
                }
            });
        });

        it('should validate without errors', () => {

            const error = validationFn(testSample.pathogen_adv, {
                message: validationError,
                additionalMembers: ['pathogen_text']
            }, 'pathogen_adv', testSample);
            expect(error).toBe(null);
        });

        it('should not validate', () => {
            const differentSample = {
                sample_id: '1',
                sample_id_avv: '1-ABC',
                pathogen_adv: 'Bob',
                pathogen_text: '',
                sampling_date: '14.11.2006',
                isolation_date: '15.11.2016',
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

            const error = validationFn(differentSample.pathogen_adv, {
                message: validationError,
                additionalMembers: ['pathogen_text']
            }, 'pathogen_adv', differentSample);
            expect(error).toEqual(validationError);
        });
    });

    describe('dependentFields', () => {
        it('should validate without errors', () => {
            const error = dependentFields(testSample.sampling_location_zip, {
                message: validationError,
                dependents: ['sampling_location_text']
            }, 'sampling_location_zip', testSample);
            expect(error).toBe(null);
        });

    });

    describe('numbersOnly', () => {
        it('should validate without errors', () => {
            const error = numbersOnly(testSample.topic_adv, {
                message: validationError
            }, 'topic_adv', testSample);
            expect(error).toBe(null);
        });
    });

    describe('registeredZoMo', () => {
        it('should validate without errors', () => {

            const zoMoSample = {
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
                sampling_reason_adv: '81',
                sampling_reason_text: '',
                operations_mode_adv: '4010000',
                operations_mode_text: 'Lebensmitteleinzelhandel',
                vvvo: '',
                comment: ''
            };

            const fakeEntry = {
                'ADV8-Kode': '4010000',
                'ADV8-Text1': 'Milcherzeuger',
                'Kodiersystem': '01',
                'ADV3-Kode': '063502',
                'ADV3-Text1': 'Mastschweine; Kot',
                'Programm': 'EB4',
                'Tierart': 'Mastschwein',
                'Matrix': 'Kot',
                'Probenahmeort': 'Erzeugerbetrieb',
                'Erreger': 'EC',
                'JAHR': 2017,
                'Matrix-B': 'TNShMsKo',
                'ADV8_1digit': 1
            };

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([fakeEntry]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };

            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = registeredZoMo(mockCatalogService)(zoMoSample.operations_mode_adv, {
                message: validationError,
                group: [{
                    attr: 'operations_mode_adv',
                    code: 'ADV8-Kode'
                }, {
                    attr: 'matrix_adv',
                    code: 'ADV3-Kode'
                }, {
                    attr: 'topic_adv',
                    code: 'Kodiersystem'
                }],
                year: ['sampling_date', 'isolation_date']
            }, 'operations_mode_adv', zoMoSample);
            expect(error).toBe(null);
        });
    });

    describe('nonUniqueEntry', () => {
        it('should validate without errors', () => {

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };
            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = nonUniqueEntry(mockCatalogService)(testSample.matrix_adv, {
                message: validationError,
                catalog: 'adv3',
                key: 'Kode',
                differentiator: ['Kodiersystem', 'topic_adv']
            }, 'matrix_adv', testSample);
            expect(error).toBe(null);
        });

        it('should validate without errors because topic makes entry unique', () => {

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };
            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = nonUniqueEntry(mockCatalogService)(testSample.matrix_adv, {
                message: validationError,
                catalog: 'adv3',
                key: 'Kode',
                differentiator: ['Kodiersystem', 'topic_adv']
            }, 'matrix_adv', testSample);
            expect(error).toEqual(null);
        });

        it('should not validate without errors because topic does not differentiate', () => {

            testSample.topic_adv = '12';

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };
            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = nonUniqueEntry(mockCatalogService)(testSample.matrix_adv, {
                message: validationError,
                catalog: 'adv3',
                key: 'Kode',
                differentiator: ['Kodiersystem', 'topic_adv']
            }, 'matrix_adv', testSample);
            const amendedError = { ...validationError };
            amendedError.message = amendedError.message + ' Entweder \'01\' für \'Test1\' oder \'15\' für \'Test2\'.';
            expect(error).toEqual(amendedError);
        });

        it('should not validate without errors because of missing Topic', () => {

            testSample.topic_adv = '';

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([
                    {
                        Kodiersystem: '01',
                        Kode: '020301',
                        Text1: 'Test1'
                    },
                    {
                        Kodiersystem: '15',
                        Kode: '020301',
                        Text1: 'Test2'
                    }
                ]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };
            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = nonUniqueEntry(mockCatalogService)(testSample.matrix_adv, {
                message: validationError,
                catalog: 'adv3',
                key: 'Kode',
                differentiator: ['Kodiersystem', 'topic_adv']
            }, 'matrix_adv', testSample);
            const amendedError = { ...validationError };
            amendedError.message = amendedError.message + ' Entweder \'01\' für \'Test1\' oder \'15\' für \'Test2\'.';
            expect(error).toEqual(amendedError);
        });
    });

    describe('inCatalog', () => {
        it('should validate without errors', () => {

            // tslint:disable-next-line
            const mockCatalog: ICatalog<any> = {
                getEntriesWithKeyValue: (key: string, value: string) => ([]),
                getEntryWithId: (id: string) => ({}),
                containsEntryWithId: (id: string) => true,
                containsEntryWithKeyValue: (key: string, value: string) => true,
                hasUniqueId: () => true,
                getUniqueId: () => '',
                dump: () => []
            };
            const mockCatalogService: ICatalogService = {
                getCatalog: () => mockCatalog
            };
            const error = inCatalog(mockCatalogService)(testSample.matrix_adv, {
                message: validationError,
                catalog: 'adv3',
                key: 'Kode'
            }, 'matrix_adv', testSample);
            expect(error).toBe(null);
        });
    });

});
