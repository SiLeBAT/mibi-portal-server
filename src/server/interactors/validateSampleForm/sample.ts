import { ISampleData, IValidationErrorCollection } from "../../entities/validation";

export interface ISample {
    data: ISampleData,
    id_avv_pathogen: string;
    id_pathogen: string;
    errors: IValidationErrorCollection;
}

function createSample(data: ISampleData, id_pathogen: string = '', id_avv_pathogen: string = '') {
    return {
        data,
        id_avv_pathogen: '',
        id_pathogen: '',
        errors: {}
    }
}

export {
    createSample
}