import * as _ from 'lodash';
import { IValidationError } from '../application';
import { IValidationErrorCollection } from './validator.entity';

const ZOMO_CODE: number = 81;
const ZOMO_STRING: string = 'Zoonosen-Monitoring - Planprobe';

export type EditValue = string;
export interface Sample {
    readonly pathogenIdAVV?: string;
    readonly pathogenId?: string;
    correctionSuggestions: CorrectionSuggestions[];
    edits: Record<string, EditValue>;
    clone(): Sample;
    getData(): SampleData;
    correctField(key: keyof SampleData, value: string): void;
    setErrors(errors: IValidationErrorCollection): void;
    addErrorTo(id: string, errors: IValidationError): void;
    getErrors(): IValidationErrorCollection;
    addErrors(errors: IValidationErrorCollection): void;
    isZoMo(): boolean;
}

export interface CorrectionSuggestions {
    field: keyof SampleData;
    original: string;
    correctionOffer: string[];
    code: number;
}

export interface SampleData {
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

class SampleImpl implements Sample {

    correctionSuggestions: CorrectionSuggestions[];
    edits: Record<string, EditValue>;
    private errors: IValidationErrorCollection;

    constructor(private data: SampleData) {
        this.errors = {};
        this.edits = {};
        this.correctionSuggestions = [];
    }

    getData() {
        return this.data;
    }

    get pathogenId(): string | undefined {
        if (!this.data.sample_id || !this.data.pathogen_adv) {
            return;
        }
        return (this.data.sample_id + this.data.pathogen_adv + (this.data.pathogen_text === this.data.pathogen_adv ? '' : this.data.pathogen_text)).replace(/\s+/g, '');
    }

    get pathogenIdAVV(): string | undefined {
        if (!this.data.sample_id_avv || !this.data.pathogen_adv) {
            return;
        }
        return (this.data.sample_id_avv + this.data.pathogen_adv + (this.data.pathogen_text === this.data.pathogen_adv ? '' : this.data.pathogen_text)).replace(/\s+/g, '');
    }

    setErrors(errors: IValidationErrorCollection = {}) {
        this.errors = errors;
    }

    addErrors(errors: IValidationErrorCollection = {}) {
        _.forEach(errors, (v, k) => {
            if (this.errors[k]) {
                this.errors[k] = [...this.errors[k], ...v];
            } else {
                this.errors[k] = [ ...v];
            }

        });
    }

    getErrors(): IValidationErrorCollection {
        return this.errors;
    }

    isZoMo(): boolean {
        return this.getData().sampling_reason_adv === ('' + ZOMO_CODE) || this.getData().sampling_reason_text === ZOMO_STRING;
    }

    addErrorTo(id: string, error: IValidationError) {
        if (!this.errors[id]) {
            this.errors[id] = [];
        }
        this.errors[id].push(error);

    }

    correctField(key: keyof SampleData, value: string) {
        this.data[key] = value;
    }

    clone() {
        const d = { ...this.data };
        const s = new SampleImpl(d);
        s.correctionSuggestions = [...this.correctionSuggestions];
        s.errors = { ...this.errors };
        return s;
    }
}

function createSample(data: SampleData): Sample {
    return new SampleImpl(data);
}

export {
    createSample
};
