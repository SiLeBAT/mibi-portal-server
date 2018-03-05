import * as  moment from 'moment';
import { validateSample } from './../validator';
import { initialize } from './../validator';

moment.locale("de");

describe('Sample Validation', () => {
    let testSample
    beforeEach(() => {
        testSample = {
            getData() {
                return {
                    sample_id: "1",
                    sample_id_avv: "1-ABC",
                    pathogen_adv: "Escherichia coli",
                    pathogen_text: "",
                    sampling_date: "01.02.2017",
                    isolation_date: "01.03.2017",
                    sampling_location_adv: "11000000",
                    sampling_location_zip: "10787",
                    sampling_location_text: "Berlin",
                    topic_adv: "01",
                    matrix_adv: "063502",
                    matrix_text: "Hähnchen auch tiefgefroren",
                    process_state: "999",
                    sampling_reason_adv: "10",
                    sampling_reason_text: "Planprobe",
                    operations_mode_adv: "4010000",
                    operations_mode_text: "Lebensmitteleinzelhandel",
                    vvvo: "",
                    comment: ""
                }
            },
            isZoMo() {
                return false;
            }
        };
    });

    it('should throw an error', () => {
        expect(() => {
            validateSample(testSample);
        }).toThrow();
    });

    it('should validate without errors', () => {
        initialize({
            dateFormat: "DD-MM-YYYY",
            dateTimeFormat: "DD-MM-YYYY",
            catalogProvider: jest.fn()
        });
        const errors = validateSample(testSample);
        expect(errors).toBeUndefined();
    });
});