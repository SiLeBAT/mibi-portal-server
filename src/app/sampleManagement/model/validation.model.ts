import { Sample, SampleProperty, SamplePropertyValues } from './sample.model';
import { CatalogService } from './catalog.model';
import { NRL } from '../domain/enums';

export interface ValidationError {
    code: number;
    level: number;
    message: string;
    correctionOffer?: string[];
}

export interface NRLConfig {
    selectors: string[];
    name: NRL;
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
export interface State {
    name: string;
    short: string;
    AVV: string[];
}

export interface AVVFormatCollection {
    [key: string]: string[];
}

export interface AVVFormatProvider {
    getFormat(state?: string): string[];
}

export interface ValidationOptions {
    state?: string;
    year?: string;
}
export interface FormValidatorPort {
    validateSamples(
        sampleCollection: Sample[],
        validationOptions: ValidationOptions
    ): Promise<Sample[]>;
}

export interface FormValidatorService extends FormValidatorPort {}

export interface ValidationErrorProviderPort {}

export interface ValidationErrorProvider extends ValidationErrorProviderPort {
    getError(id: number): ValidationError;
}

export interface ValidatorFunction<T extends ValidatorFunctionOptions> {
    (
        value: string,
        options: T,
        key: SampleProperty,
        attributes: SamplePropertyValues
    ): ValidationError | null;
}
export interface ValidatorFunctionOptions {
    message: ValidationError;
}
export interface MatchIdToYearOptions extends ValidatorFunctionOptions {
    regex: string[];
}

export interface MatchRegexPatternOptions extends MatchIdToYearOptions {
    ignoreNumbers: boolean;
    caseInsensitive?: boolean;
}

export interface RequiredIfOtherOptions extends ValidatorFunctionOptions {
    regex: string;
    field: SampleProperty;
}

export interface NonUniqueEntryOptions extends ValidatorFunctionOptions {
    catalog: string;
    key: string;
    differentiator: [string, SampleProperty];
}

export interface InCatalogOptions extends ValidatorFunctionOptions {
    catalog: string;
    key: string;
}

export interface MatchADVNumberOrStringOptions extends InCatalogOptions {
    alternateKeys: string[];
}

interface Group {
    code: string;
    attr: SampleProperty;
}
export interface RegisteredZoMoOptions extends ValidatorFunctionOptions {
    year: string[];
    group: Group[];
}

export interface AtLeastOneOfOptions extends ValidatorFunctionOptions {
    additionalMembers: (SampleProperty)[];
}

export interface DependentFieldsOptions extends ValidatorFunctionOptions {
    dependents: (SampleProperty)[];
}

export interface NumbersOnlyOptions extends ValidatorFunctionOptions {}

export interface ReferenceDateOptions extends ValidatorFunctionOptions {
    earliest?: (SampleProperty) | string;
    latest?: (SampleProperty) | string;
    modifier?: {
        value: number;
        unit: string;
    };
}
