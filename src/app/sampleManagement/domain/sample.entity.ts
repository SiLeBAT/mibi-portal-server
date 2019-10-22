import { NRLService } from './../model/nrl.model';
import { SampleMetaData, Analysis } from './../model/sample.model';
import * as _ from 'lodash';
import {
    Sample,
    SampleData,
    AnnotatedSampleDataEntry,
    SampleProperty
} from '../model/sample.model';
import { EditValue } from '../model/autocorrection.model';
import {
    ValidationError,
    ValidationErrorCollection
} from '../model/validation.model';
import { NRL_ID, Urgency } from './enums';

export class DefaultSample implements Sample {
    static ZOMO_CODE: number = 81;
    static ZOMO_STRING: string = 'Zoonosen-Monitoring - Planprobe';
    static create(
        data: SampleData,
        meta: SampleMetaData,
        nrlService: NRLService
    ): Sample {
        const cleanedData = _.cloneDeep(data);
        _.forEach(
            cleanedData,
            (v: AnnotatedSampleDataEntry, k: SampleProperty) => {
                cleanedData[k].value = ('' + v.value).trim();
            }
        );

        return new DefaultSample(cleanedData, meta, nrlService);
    }

    constructor(
        private data: SampleData,
        private _meta: SampleMetaData,
        private nrlService: NRLService
    ) {}

    getDataValues(): Record<string, { value: string }> {
        const valuesOnly: Record<SampleProperty, { value: string }> = {};
        return Object.keys(this.data).reduce((accumulator, property) => {
            accumulator[property] = { value: this.data[property].value };
            return accumulator;
        }, valuesOnly);
    }

    getValueFor(property: SampleProperty): string {
        return this.data[property].value;
    }

    getEntryFor(property: SampleProperty): AnnotatedSampleDataEntry {
        return this.data[property];
    }

    getAnnotatedData(): SampleData {
        return this.data;
    }

    getOldValues(): Record<string, EditValue> {
        const valuesOnly: Record<SampleProperty, string> = {};
        return Object.keys(this.data).reduce((accumulator, property) => {
            if (!_.isNil(this.data[property].oldValue)) {
                accumulator[property] = this.data[property].oldValue || '';
            }
            return accumulator;
        }, valuesOnly);
    }

    get meta(): SampleMetaData {
        return {
            ...this._meta
        };
    }
    get pathogenId(): string | undefined {
        if (!this.data.sample_id.value || !this.data.pathogen_adv.value) {
            return;
        }
        return this.data.sample_id.value + this.data.pathogen_adv.value;
    }

    get pathogenIdAVV(): string | undefined {
        if (!this.data.sample_id_avv.value || !this.data.pathogen_adv.value) {
            return;
        }
        return (
            this.data.sample_id_avv.value +
            this.data.pathogen_adv.value +
            (this.data.sample_id.value ? this.data.sample_id.value : '')
        );
    }

    addErrors(errors: ValidationErrorCollection = {}) {
        _.forEach(errors, (v, k) => {
            if (this.data[k].errors) {
                this.data[k].errors = _.uniqWith(
                    [...this.data[k].errors, ...v],
                    _.isEqual
                );
            } else {
                this.data[k].errors = [...v];
            }
        });
    }

    getErrorCount(level: number): number {
        const valuesOnly: number = 0;
        return Object.keys(this.data).reduce((accumulator, property) => {
            accumulator += this.data[property].errors.filter(
                e => e.level === level
            ).length;
            return accumulator;
        }, valuesOnly);
    }

    isZoMo(): boolean {
        return (
            this.data.sampling_reason_adv.value ===
                '' + DefaultSample.ZOMO_CODE ||
            this.data.sampling_reason_text.value === DefaultSample.ZOMO_STRING
        );
    }

    addErrorTo(id: string, error: ValidationError) {
        this.data[id].errors.push(error);
    }

    addCorrectionTo(id: string, correctionOffer: string[]) {
        this.data[id].correctionOffer = this.data[id].correctionOffer.concat(
            correctionOffer
        );
    }

    isValid(): boolean {
        let errors: ValidationError[] = [];
        for (const prop of Object.keys(this.data)) {
            errors = errors.concat(this.data[prop].errors);
        }
        return !!errors.length;
    }

    clearSingleCorrectionSuggestions() {
        return Object.keys(this.data).forEach(property => {
            if (this.data[property].correctionOffer.length === 1) {
                this.data[property].oldValue = this.data[property].value;
                this.data[property].value = this.data[
                    property
                ].correctionOffer[0];
                this.data[property].correctionOffer = [];
            }
        });
    }

    setNRL(nrl: NRL_ID) {
        this._meta.nrl = nrl;
        this._meta.analysis = {
            ...this.nrlService.getOptionalAnalysisFor(nrl),
            ...this._meta.analysis,
            ...this.nrlService.getStandardAnalysisFor(nrl)
        };
    }

    setAnalysis(analysis: Partial<Analysis>) {
        this._meta.analysis = {
            ...analysis,
            ...this.nrlService.getStandardAnalysisFor(this._meta.nrl)
        };
    }

    getAnalysis(): Partial<Analysis> {
        return { ...this._meta.analysis };
    }

    getNRL(): NRL_ID {
        return this._meta.nrl;
    }

    getUrgency(): Urgency {
        return this._meta.urgency;
    }

    setUrgency(urgency: Urgency): void {
        this._meta.urgency = urgency;
    }
    clone() {
        const d = _.cloneDeep(this.data);
        const m = _.cloneDeep(this._meta);
        const s = new DefaultSample(d, m, this.nrlService);
        return s;
    }
}
