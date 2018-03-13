import * as moment from 'moment';
import { ISampleData } from './../../sample';
import {
    referenceDate,
    atLeastOneOf,
    dependentFieldEntry,
    inPathogenIndex
} from './../customValidatorFunctions';

moment.locale('de');

describe('Custom Validator Functions', () => {

    let testSample: ISampleData;
    beforeEach(() => {
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
                message: 'TEST ERROR MESSAGE',
                field: 'operations_mode_adv',
                regex: '^4'
            }, 'process_state_adv', testSample);
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
            const error = dependentFieldEntry(testSample.process_state_adv, {
                message: errorMsg,
                field: 'operations_mode_adv',
                regex: '^1'
            }, 'process_state_adv', testSample);
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
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
                message: errorMsg,
                field: 'operations_mode_adv',
                regex: '^4'
            }, 'process_state_adv', differentSample);
            expect(error).toBe(errorMsg);
        });

        it('should validate without errors', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
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
                message: errorMsg,
                field: 'operations_mode_adv',
                regex: '^1'
            }, 'process_state_adv', differentSample);
            expect(error).toBe(null);
        });

    });

    describe('atLeastOneOf', () => {
        it('should validate without errors', () => {
            const error = atLeastOneOf(testSample.sampling_reason_adv, {
                message: 'TEST ERROR MESSAGE',
                additionalMembers: ['sampling_reason_text']
            }, 'sampling_reason_adv', testSample);
            expect(error).toBe(null);
        });

        it('should validate without errors', () => {
            const error = atLeastOneOf(testSample.sampling_reason_adv, {
                message: 'TEST ERROR MESSAGE',
                additionalMembers: ['comment']
            }, 'sampling_reason_adv', testSample);
            expect(error).toBe(null);
        });

        it('should fail validation with error message', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
            const error = atLeastOneOf(testSample.vvvo, {
                message: errorMsg,
                additionalMembers: ['comment']
            }, 'vvvo', testSample);
            expect(error).toBe(errorMsg);
        });
    });

    describe('referenceDate', () => {
        it('should not validate', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
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
                message: errorMsg,
                earliest: 'isolation_date',
                modifier: {
                    value: 1,
                    unit: 'year'
                }
            }, 'sampling_date', oldSample);
            expect(error).toBe(errorMsg);
        });

        it('should not validate', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
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
                message: errorMsg,
                earliest: 'NOW',
                modifier: {
                    value: 10,
                    unit: 'year'
                }
            }, 'sampling_date', oldSample);
            expect(error).toBe(errorMsg);
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
            const errorMsg = 'TEST ERROR MESSAGE';

            const error = validationFn(testSample.pathogen_adv, {
                message: errorMsg,
                additionalMembers: ['pathogen_text']
            }, 'pathogen_adv', testSample);
            expect(error).toBe(null);
        });

        it('should not validate', () => {
            const errorMsg = 'TEST ERROR MESSAGE';
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
                message: errorMsg,
                additionalMembers: ['pathogen_text']
            }, 'pathogen_adv', differentSample);
            expect(error).toBe(errorMsg);
        });
    });

});
