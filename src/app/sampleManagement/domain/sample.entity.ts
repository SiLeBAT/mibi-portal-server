import { IValidationError } from './validationErrorProvider.entity';
import { IValidationErrorCollection } from './validator.entity';

const ZOMO_CODE: number = 81;
const ZOMO_STRING: string = 'Zoonosen-Monitoring - Planprobe';

export interface ISample {
    readonly pathogenIdAVV?: string;
    readonly pathogenId?: string;
    autoCorrections: IAutoCorrectedValue[];
    clone(): ISample;
    getData(): ISampleData;
    correctField(key: keyof ISampleData, value: string): void;
    setErrors(errors: IValidationErrorCollection): void;
    addErrorTo(id: string, errors: IValidationError): void;
    getErrors(): IValidationErrorCollection;
    isZoMo(): boolean;
}

export interface IAutoCorrectedValue {
    field: keyof ISampleData;
    original: string;
    correctionOffer: string[];
}

export interface ISampleData {
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

class Sample implements ISample {

    autoCorrections: IAutoCorrectedValue[];
    private errors: IValidationErrorCollection;

    constructor(private data: ISampleData) {
        this.errors = {};
        this.autoCorrections = [];
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

    correctField(key: keyof ISampleData, value: string) {
        this.data[key] = value;
    }

    clone() {
        const d = { ...this.data };
        const s = new Sample(d);
        s.autoCorrections = [...this.autoCorrections];
        s.errors = { ...this.errors };
        return s;
    }
}

function createSample(data: ISampleData): ISample {
    return new Sample(data);
}

export {
    createSample
};
