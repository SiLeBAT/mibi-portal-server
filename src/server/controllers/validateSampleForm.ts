import * as moment from 'moment';
import * as _ from 'lodash';
import { logger } from './../aspects';
import { ServerError } from './../aspects';
import { validateSamples, ISample, createSample } from './../interactors/validateSampleForm';

moment.locale("de");

interface IValidationRequest extends Array<ISampleDTO> { }

interface ISampleDTO {
    sample_id: string;
    sample_id_avv: string;
    pathogen_adv: string;
    pathogen_text: string;
    sampling_date: string;
    isolation_date: string;
    sampling_location_adv: string;
    sampling_location_zip: string;
    sampling_location_text: string;
    topic_adv: string;
    matrix_adv: string;
    matrix_text: string;
    process_state: string;
    sampling_reason_adv: string;
    sampling_reason_text: string;
    operations_mode_adv: string;
    operations_mode_text: string;
    vvvo: string;
    comment: string;
}

interface IValidationErrorCollectionDTO {
    [key: string]: IValidationErrorDTO
}

interface IValidationErrorDTO {
    code: number;
    level: number;
    message: string;
}

interface IValidationResponse {
    data: ISampleDTO,
    errors: IValidationErrorCollectionDTO
}

export function validateSampleForm(req, res) {
    logger.info('JSON POST request received')
    // FIXME: Should not be instantiated here.
    const samples: ISample[] = fromDTOToSamples(req.body);
    const rawValidationResult = validateSamples(samples);
    const formattedValidationResult = fromErrorsToDTO(rawValidationResult);
    return res
        .status(200)
        .json(formattedValidationResult);
}

function fromErrorsToDTO(samples: ISample[]) {

    return samples.map((s: ISample) => {
        let errors = {};
        _.forEach(s.errors, (e, i) => {
            errors[i] = e.map(f => ({
                code: f.code,
                level: f.level,
                message: f.message
            }));
        })
        return {
            data: s.data,
            errors: errors
        }

    });
}

function fromDTOToSamples(dto: IValidationRequest): ISample[] {
    if (!Array.isArray(dto)) {
        throw new ServerError("Invalid input: Array expected");
    }
    return dto.map(s => createSample({ ...s }));
}
