
import * as moment from 'moment';
import * as _ from 'lodash';
import { IPathogenIndex } from './pathogenIndex';
import { ICatalog } from '..';

moment.locale('de');

export interface ICatalogProvider {
    // tslint:disable-next-line
    (catalogName: string): ICatalog<any>;
}

// tslint:disable-next-line
function dependentFieldEntry(value: any, options: any, key: any, attributes: any) {
    const re = new RegExp(options.regex);
    const matchResult = re.test(attributes[options.field]);
    if (matchResult && isEmptyString(attributes[key])) return options.message;
    return null;
}

function nonUniqueEntry(catalogProvider: ICatalogProvider) {
    // tslint:disable-next-line
    return (value: any, options: any, key: any, attributes: any) => {
        if (attributes[key]) {
            const cat = catalogProvider(options.catalog);
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

function inCatalog(catalogProvider: ICatalogProvider) {
    // tslint:disable-next-line
    return (value: any, options: any, key: any, attributes: any) => {
        if (attributes[key]) {
            const cat = catalogProvider(options.catalog);

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

function inPathogenIndex(pathogenIndex: IPathogenIndex) {
    // tslint:disable-next-line
    return (value: any, options: any, key: any, attributes: any) => {

        const additionalMembers = options.additionalMembers || [];
        // tslint:disable-next-line
        const testValue = additionalMembers.reduce((acc: any, v: any) => acc + attributes[v], value).replace(/\s/g, '');
        if (!pathogenIndex.contains(testValue)) {
            return options.message;
        }
        return null;
    };
}

function registeredZoMo(catalogProvider: ICatalogProvider) {
    // tslint:disable-next-line
    return (value: any, options: any, key: any, attributes: any) => {
        const years = options.year.map((y: string) => {
            const yearValue = attributes[y];
            const formattedYear = moment.utc(yearValue, 'DD-MM-YYYY').format('YYYY');
            return parseInt(formattedYear, 10);
        });
        if (years.length > 0) {
            const yearToCheck = Math.min(...years);
            const cat = catalogProvider('zsp' + yearToCheck);
            if (cat) {
                // tslint:disable-next-line
                const groupValues = options.group.map((g: any) => attributes[g.attr]);
                const entry = cat.getEntriesWithKeyValue(options.group[0].code, groupValues[0]);
                const filtered = _.filter(entry, e => e[options.group[2].code] === groupValues[2]).filter(m => m[options.group[1].code] === groupValues[1]);
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
// tslint:disable-next-line
function atLeastOneOf(value: any, options: any, key: any, attributes: any) {
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

// tslint:disable-next-line
function dependentFields(value: any, options: any, key: any, attributes: any) {
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

// tslint:disable-next-line
function numbersOnly(value: any, options: any, key: any, attributes: any) {
    if (attributes[key]) {
        let numOnly = new RegExp('^[0-9]*$');
        if (!numOnly.test(value)) {
            return options.message;
        }
    }
    return null;
}

// Refactor
// tslint:disable-next-line
function referenceDate(value: any, options: any, key: any, attributes: any) {
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

        if (attributes[referenceDateId]) {
            referenceDate = moment.utc(attributes[referenceDateId], 'DD-MM-YYYY');
        } else if (referenceDateId === 'NOW') {
            referenceDate = moment();
        } else {
            referenceDate = moment.utc(referenceDateId, 'DD-MM-YYYY');
        }

        if (options.earliest) {
            if (options.modifier) {
                referenceDate = referenceDate.subtract(options.modifier.value, options.modifier.unit);
            }
        } else if (options.latest) {
            if (options.modifier) {
                referenceDate = referenceDate.add(options.modifier.value, options.modifier.unit);
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
