
import * as moment from 'moment';
import * as _ from 'lodash';
import { ICatalog } from '..';
import { SampleData } from './sample.entity';
import { ICatalogService, ValidationError } from '../application';
import { ApplicationDomainError } from '../../sharedKernel';

moment.locale('de');

export interface ICatalogProvider {
    // tslint:disable-next-line
    (catalogName: string): ICatalog<any>;
}
export interface IValidatorFunction<T extends IValidatiorFunctionOptions> {
    (value: string, options: T, key: keyof SampleData, attributes: SampleData): ValidationError | null;
}
export interface IValidatiorFunctionOptions {
    message: ValidationError;
}
export interface IMatchIdToYearOptions extends IValidatiorFunctionOptions {
    regex: string[];
}

export interface IMatchRegexPatternOptions extends IMatchIdToYearOptions {
    ignoreNumbers: boolean;
    caseInsensitive?: boolean;
}

export interface IDependentFieldEntryOptions extends IValidatiorFunctionOptions {
    regex: string;
    field: keyof SampleData;
}

function dependentFieldEntry(value: string, options: IDependentFieldEntryOptions, key: keyof SampleData, attributes: SampleData) {
    const re = new RegExp(options.regex);
    const matchResult = re.test(attributes[options.field]);
    if (matchResult && isEmptyString(attributes[key])) return { ...options.message };
    return null;
}

function numbersOnlyValue(value: string): boolean {
    const numbersOnly = /^\d+$/;
    return numbersOnly.test(value);
}
function matchesRegexPattern(value: string, options: IMatchRegexPatternOptions, key: keyof SampleData, attributes: SampleData) {
    if (!value || !options.regex.length) {
        return null;
    }
    if (options.ignoreNumbers && numbersOnlyValue(value)) {
        return null;
    }
    let success = false;
    const regexpAry = options.regex.map(
        str => {
            return new RegExp(str, options.caseInsensitive ? 'i' : undefined);
        }
    );
    regexpAry.forEach(
        regexp => {
            if (regexp.test(value)) {
                success = true;
            }
        }
    );
    return success ? null : { ...options.message };
}

function matchesIdToSpecificYear(value: string, options: IMatchIdToYearOptions, key: keyof SampleData, attributes: SampleData) {
    if (!value) {
        return null;
    }
    let currentYear = moment();
    let nextYear = moment().add(1, 'year');
    let lastYear = moment().subtract(1, 'year');
    if (attributes['sampling_date']) {
        currentYear = moment(attributes['sampling_date'], 'DD.MM.YYYY');
        nextYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').add(1, 'year');
        lastYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').subtract(1, 'year');
    }

    const changedArray = _.flatMap(options.regex,
        (entry: string) => {
            const result: string[] = [];
            if (entry.includes('yyyy')) {
                const currentEntry = entry.replace('yyyy', currentYear.format('YYYY'));
                const nextEntry = entry.replace('yyyy', nextYear.format('YYYY'));
                const lastEntry = entry.replace('yyyy', lastYear.format('YYYY'));
                result.push(lastEntry);
                result.push(currentEntry);
                result.push(nextEntry);
            } else if (entry.includes('yy')) {
                const currentEntry = entry.replace('yy', currentYear.format('YY'));
                const nextEntry = entry.replace('yy', nextYear.format('YY'));
                const lastEntry = entry.replace('yy', lastYear.format('YY'));
                result.push(lastEntry);
                result.push(currentEntry);
                result.push(nextEntry);
            } else {
                result.push(entry);
            }
            return result;
        }
    );
    options.regex = changedArray;
    return matchesRegexPattern(value, { ...options, ...{ ignoreNumbers: false } }, key, attributes);
}

export interface INonUniqueEntryOptions extends IValidatiorFunctionOptions {
    catalog: string;
    key: string;
    differentiator: [string, keyof SampleData];
}

function nonUniqueEntry(catalogService: ICatalogService): IValidatorFunction<INonUniqueEntryOptions> {
    return (value: string, options: INonUniqueEntryOptions, key: keyof SampleData, attributes: SampleData) => {
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);
            if (cat && options.key) {
                const entries = cat.getEntriesWithKeyValue(options.key, value);
                if (entries.length < 2) return null;
                if (attributes[options.differentiator[1]]) {
                    const n = _.filter(entries, e => e[options.differentiator[0]] === attributes[options.differentiator[1]]);
                    if (n.length === 1) return null;
                }
                // TODO: find better way to do this
                const newMessage: ValidationError = { ...options.message };
                newMessage.message += ` Entweder '${entries[0].Kodiersystem}' für '${entries[0].Text1}' oder '${entries[1].Kodiersystem}' für '${entries[1].Text1}'.`;
                return newMessage;
            }
        }
        return null;
    };
}

export interface IInCatalogOptions extends IValidatiorFunctionOptions {
    catalog: string;
    key: string;
}

function inCatalog(catalogService: ICatalogService): IValidatorFunction<IInCatalogOptions> {
    return (value: string, options: IInCatalogOptions, key: keyof SampleData, attributes: SampleData) => {
        const trimmedValue = value.trim();
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key ? options.key : cat.getUniqueId();
                if (key && !cat.containsEntryWithKeyValue(key, trimmedValue)) {
                    return { ...options.message };
                }
            }
        }
        return null;
    };
}

export interface IMatchADVNumberOrStringOptions extends IInCatalogOptions {
    alternateKeys: string[];
}
// Matching for ADV16 accorind to #mps53
function matchADVNumberOrString(catalogService: ICatalogService): IValidatorFunction<IInCatalogOptions> {
    return (value: string, options: IMatchADVNumberOrStringOptions, key: keyof SampleData, attributes: SampleData) => {
        const trimmedValue = value.trim();
        const altKeys = options.alternateKeys || [];
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key ? options.key : cat.getUniqueId();
                if (!key) {
                    return null;
                }
                if (numbersOnlyValue(value)) {
                    if (!cat.containsEntryWithKeyValue(key, trimmedValue)) {
                        return { ...options.message };
                    }
                } else {
                    let found = false;
                    altKeys.forEach(k => {
                        found = cat.containsEntryWithKeyValue(k, trimmedValue) || found;
                    });
                    if (found) {
                        return null;
                    }
                    return { ...options.message };
                }
            }
        }
        return null;
    };
}

interface IGroup {
    code: string;
    attr: keyof SampleData;
}
export interface IRegisteredZoMoOptions extends IValidatiorFunctionOptions {
    year: string[];
    group: IGroup[];
}

function registeredZoMo(catalogService: ICatalogService): IValidatorFunction<IRegisteredZoMoOptions> {

    return (value: string, options: IRegisteredZoMoOptions, key: keyof SampleData, attributes: SampleData) => {
        const years = options.year.map((y: keyof SampleData) => {
            const yearValue = attributes[y];
            const formattedYear = moment.utc(yearValue, 'DD-MM-YYYY').format('YYYY');
            return parseInt(formattedYear, 10);
        });
        if (years.length > 0) {
            const yearToCheck = Math.min(...years);
            const cat = catalogService.getCatalog('zsp' + yearToCheck);
            if (cat) {
                const groupValues = options.group.map((g: IGroup) => attributes[g.attr]);
                const entry = cat.getEntriesWithKeyValue(options.group[0].code, groupValues[0]);
                const filtered = _.filter(entry, e => e[options.group[2].code] === groupValues[2])
                    .filter(m => m[options.group[1].code] === groupValues[1]);
                if (filtered.length < 1) {
                    return { ...options.message };
                }
            } else {
                return { ...options.message };
            }
        } else {
            return { ...options.message };
        }
        return null;
    };
}

export interface IAtLeastOneOfOptions extends IValidatiorFunctionOptions {
    additionalMembers: (keyof SampleData)[];
}

function atLeastOneOf(value: string, options: IAtLeastOneOfOptions, key: keyof SampleData, attributes: SampleData) {
    if (isEmptyString(attributes[key])) {
        for (let i = 0; i < options.additionalMembers.length; i++) {
            const element = options.additionalMembers[i];
            if (!isEmptyString(attributes[element])) {
                return null;
            }
        }
        return { ...options.message };
    }
    return null;
}
function dateAllowEmpty(value: string, options: IAtLeastOneOfOptions, key: keyof SampleData, attributes: SampleData) {

    if (isEmptyString(value)) {
        return null;
    } else if (moment.utc(value, ['DD.MM.YYYY', 'D.MM.YYYY', 'D.M.YYYY', 'DD.M.YYYY'], true).isValid()) {
        return null;
    } else {
        return { ...options.message };
    }
    return null;
}

export interface IDependentFieldsOptions extends IValidatiorFunctionOptions {
    dependents: (keyof SampleData)[];
}

function dependentFields(value: string, options: IDependentFieldsOptions, key: keyof SampleData, attributes: SampleData) {
    if (attributes[key]) {
        for (let i = 0; i < options.dependents.length; i++) {
            const element = options.dependents[i];
            if (!attributes[element]) {
                return { ...options.message };
            }
        }
    }
    return null;
}

export interface INumbersOnlyOptions extends IValidatiorFunctionOptions {
}

function numbersOnly(value: string, options: INumbersOnlyOptions, key: keyof SampleData, attributes: SampleData) {
    if (attributes[key]) {
        if (!numbersOnlyValue(value)) {
            return { ...options.message };
        }
    }
    return null;
}

export interface IReferenceDateOptions extends IValidatiorFunctionOptions {
    earliest?: (keyof SampleData) | string;
    latest?: (keyof SampleData) | string;
    modifier?: {
        value: number;
        unit: string;
    };
}

// tslint:disable-next-line
function referenceDate(value: string, options: IReferenceDateOptions, key: keyof SampleData, attributes: any) {
    if (moment.utc(value, 'DD-MM-YYYY').isValid()) {
        let referenceDateId;
        let refereceOperation;
        let referenceDate;

        if (options.earliest) {
            referenceDateId = options.earliest;
            refereceOperation = dateIsSameOrBeforeReference;
        } else if (options.latest) {
            referenceDateId = options.latest;
            refereceOperation = dateIsSameOrAfterReference;
        } else {
            throw new ApplicationDomainError('Error occured trying to validate');
        }

        if (attributes[(referenceDateId)]) {
            referenceDate = moment.utc(attributes[(referenceDateId)], 'DD-MM-YYYY');
        } else if (referenceDateId === 'NOW') {
            referenceDate = moment();
        } else {
            referenceDate = moment.utc(referenceDateId, 'DD-MM-YYYY');
        }

        if (options.earliest) {
            if (options.modifier) {
                // tslint:disable-next-line
                referenceDate = referenceDate.subtract(options.modifier.value as any, options.modifier.unit);
            }
        } else if (options.latest) {
            if (options.modifier) {
                // tslint:disable-next-line
                referenceDate = referenceDate.add(options.modifier.value as any, options.modifier.unit);
            }
        }

        if (!referenceDate.isValid() || refereceOperation(moment.utc(value, 'DD-MM-YYYY'), referenceDate)) {
            return null;
        } else {
            return { ...options.message };
        }
    }
    return null;

}

function dateIsSameOrAfterReference(date: moment.Moment, referenceDate: moment.Moment) {
    return referenceDate.isSameOrAfter(date, 'day');
}

function dateIsSameOrBeforeReference(date: moment.Moment, referenceDate: moment.Moment) {
    return referenceDate.isSameOrBefore(date, 'day');
}

function isEmptyString(str: string): boolean {
    return !(('' + str).trim());
}

export {
    referenceDate,
    atLeastOneOf,
    dateAllowEmpty,
    dependentFields,
    dependentFieldEntry,
    numbersOnly,
    inCatalog,
    registeredZoMo,
    nonUniqueEntry,
    matchADVNumberOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear
};
