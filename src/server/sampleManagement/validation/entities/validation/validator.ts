import * as  validate from 'validate.js';
import * as  moment from 'moment';
import * as  _ from 'lodash';

import { getConstraints, ConstraintSet } from './validationConstraints';
import { ICatalog, ISample } from '../';
import { ServerError } from './../../../../../aspects';
import { IValidationError } from './validationErrorProvider';
import { constants } from 'os';

moment.locale("de");

export interface ICatalogProvider {
    (catalogName: string): ICatalog<any>;
}
export interface IValidationErrorCollection {
    [key: string]: IValidationError[];
}

export interface IValidatorConfig {
    dateFormat: string;
    dateTimeFormat: string;
    catalogProvider: ICatalogProvider;
}

let isInitalized = false;
let catalogProvider;

export function initialize(config: IValidatorConfig) {
    // Before using it we must add the parse and format functions
    // Here is a sample implementation using moment.js
    validate.extend(validate.validators.datetime, {
        // The value is guaranteed not to be null or undefined but otherwise it
        // could be anything.
        parse: function (value, options) {
            const result = +moment.utc(value, config.dateFormat);
            return result;
        },
        // Input is a unix timestamp
        format: function (value, options) {
            var format = options.dateOnly ? config.dateFormat : config.dateTimeFormat; //"DD-MM-YYYY" : "DD-MM-YYYY hh:mm:ss";
            const result = moment.utc(value).format(format)
            return result;
        }
    });
    registerCustomValidators();
    catalogProvider = config.catalogProvider;
    isInitalized = true;
}

export function validateSample(sample: ISample): IValidationErrorCollection {
    if (!isInitalized) {
        throw new ServerError("Validator needs to be initialized");
    }

    const constraintSet = sample.isZoMo() ? getConstraints(ConstraintSet.ZOMO) : getConstraints(ConstraintSet.STANDARD);

    return validate(sample.getData(), constraintSet);
}

function registerCustomValidators() {
    // Register Custom Validators
    validate.validators.futureDate = referenceDate;
    validate.validators.oldSample = referenceDate;
    validate.validators.atLeastOneOf = atLeastOneOf;
    validate.validators.referenceDate = referenceDate;
    validate.validators.timeBetween = referenceDate;
    validate.validators.dependentFields = dependentFields;
    validate.validators.dependentFieldEntry = dependentFieldEntry;
    validate.validators.numbersOnly = numbersOnly;
    validate.validators.inCatalog = inCatalog;
    validate.validators.registeredZoMo = registeredZoMo;
    validate.validators.nonUniqueEntry = nonUniqueEntry;
}

function dependentFieldEntry(value, options, key, attributes) {
    const re = new RegExp(options.regex);
    const trimmed = ('' + attributes[key]).replace(/\s/g, '');
    if (re.test(attributes[options.field]) && !trimmed) {
        return options.message;
    }
    return null;
}

function nonUniqueEntry(value, options, key, attributes) {
    if (!!attributes[key]) {
        const cat: ICatalog<any> = catalogProvider(options.catalog)
        if (!!cat && !!options.key) {
            const entries = cat.getEntriesWithKeyValue(options.key, value);
            if (entries.length > 1) {
                // TODO find better way to do this
                options.message.message += ` Entweder '${entries[0].Kodiersystem}' für '${entries[0].Text1}' oder '${entries[1].Kodiersystem}' für '${entries[1].Text1}'.`;
                return options.message;
            }
        }
    }
    return null;
}

function inCatalog(value, options, key, attributes) {
    if (!!attributes[key]) {
        const cat: ICatalog<any> = catalogProvider(options.catalog)

        if (!!cat) {
            const key: string = options.key ? options.key : cat.getUniqueId();
            if (!!key && !cat.containsEntryWithKeyValue(key, value)) {
                return options.message;
            }
        }
    }
    return null;
}

function registeredZoMo(value, options, key, attributes) {
    const years = options.year.map(y => {
        const yearValue = attributes[y];
        const formattedYear = moment.utc(yearValue, 'DD-MM-YYYY').format('YYYY');
        return parseInt(formattedYear);
    });
    if (years.length > 0) {
        const yearToCheck = Math.min(...years);
        const cat: ICatalog<any> = catalogProvider('zsp' + yearToCheck);
        if (!!cat) {
            const groupValues = options.group.map(g => attributes[g.attr]);
            const entry = cat.getEntriesWithKeyValue(options.group[0].code, groupValues[0]);
            const filtered = _.filter(entry, e => e[options.group[2].code] === groupValues[2]).filter(m => m[options.group[1].code] === groupValues[1]);
            if (filtered.length < 1) {
                return options.message;
            }
        }
        else {
            return options.message;
        }
    }
    else {
        return options.message;
    }
    return null;
}

function atLeastOneOf(value, options, key, attributes) {
    const trimmed = ('' + attributes[key]).replace(/\s/g, '');
    if (!trimmed) {
        for (let i = 0; i < options.additionalMembers.length; i++) {
            const element = options.additionalMembers[i];
            const trimmed2 = ('' + attributes[element]).replace(/\s/g, '');
            if (!trimmed2) {
                return options.message;
            }
        }
    }
    return null;
}

function dependentFields(value, options, key, attributes) {
    if (!!attributes[key]) {
        for (let i = 0; i < options.dependents.length; i++) {
            const element = options.dependents[i];
            if (!attributes[element]) {
                return options.message;
            }
        }
    }
    return null;
}

function numbersOnly(value, options, key, attributes) {
    if (!!attributes[key]) {
        let numOnly = new RegExp('^[0-9]*$');
        if (!numOnly.test(value)) {
            return options.message;
        }
    }
    return null;
}

// Refactor
function referenceDate(value, options, key, attributes) {
    if (moment.utc(value, 'DD-MM-YYYY').isValid()) {
        let referenceDateId;
        let refereceOperation;
        let referenceDate;

        if (options.earliest) {
            referenceDateId = options.earliest;
            refereceOperation = dateIsBeforeReference;
        }
        else if (options.latest) {
            referenceDateId = options.latest;
            refereceOperation = dateIsAfterReference;
        }

        if (!!attributes[referenceDateId]) {
            referenceDate = moment.utc(attributes[referenceDateId], 'DD-MM-YYYY');
        }
        else if (referenceDateId === 'NOW') {
            referenceDate = moment();
        }
        else {
            referenceDate = moment.utc(referenceDateId, 'DD-MM-YYYY');
        }

        if (options.earliest) {
            if (options.modifier) {
                referenceDate = referenceDate.subtract(options.modifier.value, options.modifier.unit)
            }
        }
        else if (options.latest) {
            if (options.modifier) {
                referenceDate = referenceDate.add(options.modifier.value, options.modifier.unit)
            }
        }

        if (!referenceDate.isValid() || refereceOperation(moment.utc(value, 'DD-MM-YYYY'), referenceDate)) {
            return null;
        }
        else {
            return options.message;
        }
    }
    return null;

}

function dateIsAfterReference(date, referenceDate) {
    return !dateIsBeforeReference(date, referenceDate);
}

function dateIsBeforeReference(date, referenceDate) {
    return referenceDate.isBefore(date, 'day');
}
