
import * as moment from 'moment';
import * as _ from 'lodash';
import { IPathogenIndex } from './pathogenIndex';
import { ICatalog } from '..';
import { IValidationError } from '.';
import { ISampleData } from '../sample';
import { ICatalogService } from '../../application';

moment.locale('de');

export interface ICatalogProvider {
    // tslint:disable-next-line
    (catalogName: string): ICatalog<any>;
}
export interface IValidatorFunction<T extends IValidatiorFunctionOptions> {
    (value: string, options: T, key: keyof ISampleData, attributes: ISampleData): IValidationError | null;
}
export interface IValidatiorFunctionOptions {
    message: IValidationError;
}

export interface IDependentFieldEntryOptions extends IValidatiorFunctionOptions {
    regex: string;
    field: keyof ISampleData;
}

function dependentFieldEntry(value: string, options: IDependentFieldEntryOptions, key: keyof ISampleData, attributes: ISampleData) {
    const re = new RegExp(options.regex);
    const matchResult = re.test(attributes[options.field]);
    if (matchResult && isEmptyString(attributes[key])) return options.message;
    return null;
}

export interface INonUniqueEntryOptions extends IValidatiorFunctionOptions {
    catalog: string;
    key: string;
}

function nonUniqueEntry(catalogService: ICatalogService): IValidatorFunction<INonUniqueEntryOptions> {
    return (value: string, options: INonUniqueEntryOptions, key: keyof ISampleData, attributes: ISampleData) => {
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);
            if (cat && options.key) {
                const entries = cat.getEntriesWithKeyValue(options.key, value);
                if (entries.length > 1) {
                    // TODO find better way to do this
                    options.message.message += ` Entweder '${entries[0].Kodiersystem}' für '${entries[0].Text1}' oder '${entries[1].Kodiersystem}' für '${entries[1].Text1}'.`;
                    return options.message;
                }
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
    return (value: string, options: IInCatalogOptions, key: keyof ISampleData, attributes: ISampleData) => {
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key ? options.key : cat.getUniqueId();
                if (key && !cat.containsEntryWithKeyValue(key, value)) {
                    return options.message;
                }
            }
        }
        return null;
    };
}

export interface IInPathogenIndexOptions extends IValidatiorFunctionOptions {
    additionalMembers: string[];
}

function inPathogenIndex(pathogenIndex: IPathogenIndex): IValidatorFunction<IInPathogenIndexOptions> {

    return (value: string, options: IInPathogenIndexOptions, key: keyof ISampleData, attributes: ISampleData) => {
        const additionalMembers = options.additionalMembers || [];
        const testValue = additionalMembers.reduce((acc: string, v: keyof ISampleData) => acc + attributes[v], value).replace(/\s/g, '');
        if (!pathogenIndex.contains(testValue)) {
            return options.message;
        }
        return null;
    };
}

interface IGroup {
    code: string;
    attr: keyof ISampleData;
}
export interface IRegisteredZoMoOptions extends IValidatiorFunctionOptions {
    year: string[];
    group: IGroup[];
}

function registeredZoMo(catalogService: ICatalogService): IValidatorFunction<IRegisteredZoMoOptions> {

    return (value: string, options: IRegisteredZoMoOptions, key: keyof ISampleData, attributes: ISampleData) => {
        const years = options.year.map((y: keyof ISampleData) => {
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
                    return options.message;
                }
            } else {
                return options.message;
            }
        } else {
            return options.message;
        }
        return null;
    };
}

export interface IAtLeastOneOfOptions extends IValidatiorFunctionOptions {
    additionalMembers: (keyof ISampleData)[];
}

function atLeastOneOf(value: string, options: IAtLeastOneOfOptions, key: keyof ISampleData, attributes: ISampleData) {
    if (isEmptyString(attributes[key])) {
        for (let i = 0; i < options.additionalMembers.length; i++) {
            const element = options.additionalMembers[i];
            if (isEmptyString(attributes[element])) {
                return options.message;
            }
        }
    }
    return null;
}

export interface IDependentFieldsOptions extends IValidatiorFunctionOptions {
    dependents: (keyof ISampleData)[];
}

function dependentFields(value: string, options: IDependentFieldsOptions, key: keyof ISampleData, attributes: ISampleData) {
    if (attributes[key]) {
        for (let i = 0; i < options.dependents.length; i++) {
            const element = options.dependents[i];
            if (!attributes[element]) {
                return options.message;
            }
        }
    }
    return null;
}

export interface INumbersOnlyOptions extends IValidatiorFunctionOptions {
}

function numbersOnly(value: string, options: INumbersOnlyOptions, key: keyof ISampleData, attributes: ISampleData) {
    if (attributes[key]) {
        let numOnly = new RegExp('^[0-9]*$');
        if (!numOnly.test(value)) {
            return options.message;
        }
    }
    return null;
}

export interface IReferenceDateOptions extends IValidatiorFunctionOptions {
    earliest?: (keyof ISampleData) | string;
    latest?: (keyof ISampleData) | string;
    modifier?: {
        value: number;
        unit: string;
    };
}
// TODO: Clean this up.
function referenceDate(value: string, options: IReferenceDateOptions, key: keyof ISampleData, attributes: ISampleData) {
    if (moment.utc(value, 'DD-MM-YYYY').isValid()) {
        let referenceDateId;
        let refereceOperation;
        let referenceDate;

        if (options.earliest) {
            referenceDateId = options.earliest;
            refereceOperation = dateIsBeforeReference;
        } else if (options.latest) {
            referenceDateId = options.latest;
            refereceOperation = dateIsAfterReference;
        } else {
            throw new Error('Error occured trying to validate');
        }

        if (attributes[(referenceDateId as keyof ISampleData)]) {
            referenceDate = moment.utc(attributes[(referenceDateId as keyof ISampleData)], 'DD-MM-YYYY');
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
            return options.message;
        }
    }
    return null;

}

function dateIsAfterReference(date: moment.Moment, referenceDate: moment.Moment) {
    return !dateIsBeforeReference(date, referenceDate);
}

function dateIsBeforeReference(date: moment.Moment, referenceDate: moment.Moment) {
    return referenceDate.isBefore(date, 'day');
}

function isEmptyString(str: string): boolean {
    return !('' + str).replace(/\s/g, '');
}

export {
    referenceDate,
    atLeastOneOf,
    dependentFields,
    dependentFieldEntry,
    numbersOnly,
    inCatalog,
    registeredZoMo,
    nonUniqueEntry,
    inPathogenIndex
};
