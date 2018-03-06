import * as moment from 'moment';
import * as _ from 'lodash';
import { logger, ServerError } from './../../../../aspects';
import { validateSamples as validate, createSample } from './../interactors';
import { ISampleCollection, createSampleCollection, ISample } from './../entities';

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
    process_state_adv: string;
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

export function validateSamples(req, res) {
    logger.info('JSON POST request received')
    const samples: ISampleCollection = fromDTOToSamples(req.body);
    const rawValidationResult = validate(samples);
    const formattedValidationResult = fromErrorsToDTO(rawValidationResult);
    return res
        .status(200)
        .json(formattedValidationResult);
}

function fromErrorsToDTO(samples: ISampleCollection) {

    return samples.getSamples().map((s: ISample) => {
        let errors = {};
        _.forEach(s.getErrors(), (e, i) => {
            errors[i] = e.map(f => ({
                code: f.code,
                level: f.level,
                message: f.message
            }));
        })
        return {
            data: s.getData(),
            errors: errors
        }

    });
}

function fromDTOToSamples(dto: IValidationRequest): ISampleCollection {
    if (!Array.isArray(dto)) {
        throw new ServerError("Invalid input: Array expected");
    }
    const samples = dto.map(s => createSample({ ...s }));

    return createSampleCollection(samples);
}
