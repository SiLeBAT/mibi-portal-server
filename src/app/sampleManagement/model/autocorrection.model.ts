import { SampleData, SampleCollection } from './sample.model';

export interface CorrectionSuggestions {
    field: keyof SampleData;
    original: string;
    correctionOffer: string[];
    code: number;
}

export type EditValue = string;

export interface CorrectionFunction {
    (sampleData: SampleData): CorrectionSuggestions | null;
}

export interface SearchAlias {
    catalog: string;
    token: string;
    alias: string[];
}

export interface CatalogEnhancement {
    alias: string;
    text: string;
}

export interface ResultOptions {
    alias?: string;
    original: string;
    numberOfResults: number;
    property: keyof SampleData;
}
export interface FuzzySearchResultEntry {
    item: string;
    score: number;
}

export interface FormAutoCorrectionPort {
    applyAutoCorrection(
        sampleCollection: SampleCollection
    ): Promise<SampleCollection>;
}

export interface FormAutoCorrectionService extends FormAutoCorrectionPort {}
