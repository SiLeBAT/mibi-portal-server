import { Sample, SampleData, SampleCollection } from './sample.model';
import { CatalogService } from './catalog.model';

export interface ValidationError {
    code: number;
    level: number;
    message: string;
}

export interface NRLConfig {
    selectors: string[];
    name: string;
}
export interface ValidationRule {
    error: number;
    // tslint:disable-next-line
    [key: string]: any;
}

export interface ValidationRuleSet {
    [key: string]: ValidationRule;
}

export interface ValidationConstraints {
    [key: string]: ValidationRuleSet;
}

export interface Validator {
    validateSample(
        sample: Sample,
        constraintSet: ValidationConstraints
    ): ValidationErrorCollection;
}

export interface ValidationErrorCollection {
    [key: string]: ValidationError[];
}

export interface ValidatorConfig {
    dateFormat: string;
    dateTimeFormat: string;
    catalogService: CatalogService;
}

export interface SearchAlias {
    catalog: string;
    token: string;
    alias: string[];
}

export interface AVVFormatProvider {
    getFormat(state?: string): string[];
}

export interface ValidationOptions {
    state?: string;
    nrl?: string;
    year?: string;
}
export interface FormValidatorPort {
    validateSamples(
        sampleCollection: SampleCollection,
        validationOptions: ValidationOptions
    ): Promise<SampleCollection>;
}

export interface FormValidatorService extends FormValidatorPort {}

export interface NRLSelectorProvider {
    getSelectors(nrl?: string): RegExp[];
}

export interface ValidationErrorProviderPort {}

export interface ValidationErrorProvider extends ValidationErrorProviderPort {
    getError(id: number): ValidationError;
}

export interface ValidatorFunction<T extends ValidatiorFunctionOptions> {
    (
        value: string,
        options: T,
        key: keyof SampleData,
        attributes: SampleData
    ): ValidationError | null;
}
interface ValidatiorFunctionOptions {
    message: ValidationError;
}
export interface MatchIdToYearOptions extends ValidatiorFunctionOptions {
    regex: string[];
}

export interface MatchRegexPatternOptions extends MatchIdToYearOptions {
    ignoreNumbers: boolean;
    caseInsensitive?: boolean;
}

export interface DependentFieldEntryOptions extends ValidatiorFunctionOptions {
    regex: string;
    field: keyof SampleData;
}

export interface NonUniqueEntryOptions extends ValidatiorFunctionOptions {
    catalog: string;
    key: string;
    differentiator: [string, keyof SampleData];
}

export interface InCatalogOptions extends ValidatiorFunctionOptions {
    catalog: string;
    key: string;
}

export interface MatchADVNumberOrStringOptions extends InCatalogOptions {
    alternateKeys: string[];
}

interface Group {
    code: string;
    attr: keyof SampleData;
}
export interface RegisteredZoMoOptions extends ValidatiorFunctionOptions {
    year: string[];
    group: Group[];
}

export interface AtLeastOneOfOptions extends ValidatiorFunctionOptions {
    additionalMembers: (keyof SampleData)[];
}

export interface DependentFieldsOptions extends ValidatiorFunctionOptions {
    dependents: (keyof SampleData)[];
}

export interface NumbersOnlyOptions extends ValidatiorFunctionOptions {}

export interface ReferenceDateOptions extends ValidatiorFunctionOptions {
    earliest?: (keyof SampleData) | string;
    latest?: (keyof SampleData) | string;
    modifier?: {
        value: number;
        unit: string;
    };
}
