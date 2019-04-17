import * as _ from 'lodash';
import { Sample, SampleData } from '../model/sample.model';
import {
    CorrectionSuggestions,
    EditValue
} from '../model/autocorrection.model';
import {
    ValidationError,
    ValidationErrorCollection
} from '../model/validation.model';

const ZOMO_CODE: number = 81;
const ZOMO_STRING: string = 'Zoonosen-Monitoring - Planprobe';

class DefaultSample implements Sample {
    correctionSuggestions: CorrectionSuggestions[];
    edits: Record<string, EditValue>;
    private errors: ValidationErrorCollection;

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
        return this.data.sample_id + this.data.pathogen_adv;
    }

    get pathogenIdAVV(): string | undefined {
        if (!this.data.sample_id_avv || !this.data.pathogen_adv) {
            return;
        }
        return (
            this.data.sample_id_avv +
            this.data.pathogen_adv +
            (this.data.sample_id ? this.data.sample_id : '')
        );
    }

    setErrors(errors: ValidationErrorCollection = {}) {
        this.errors = errors;
    }

    addErrors(errors: ValidationErrorCollection = {}) {
        _.forEach(errors, (v, k) => {
            if (this.errors[k]) {
                this.errors[k] = [...this.errors[k], ...v];
            } else {
                this.errors[k] = [...v];
            }
        });
    }

    getErrors(): ValidationErrorCollection {
        return this.errors;
    }

    isZoMo(): boolean {
        return (
            this.getData().sampling_reason_adv === '' + ZOMO_CODE ||
            this.getData().sampling_reason_text === ZOMO_STRING
        );
    }

    addErrorTo(id: string, error: ValidationError) {
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
        const s = new DefaultSample(d);
        s.correctionSuggestions = [...this.correctionSuggestions];
        s.errors = { ...this.errors };
        return s;
    }
}

function createSample(data: SampleData): Sample {
    const cleanedData = { ...data };
    _.forEach(cleanedData, (v: string, k: keyof SampleData) => {
        cleanedData[k] = ('' + v).trim();
    });
    return new DefaultSample(cleanedData);
}

export { createSample };
