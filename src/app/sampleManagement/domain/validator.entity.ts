import * as validate from 'validate.js';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ISample } from '../';
import {
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
    matchesRegexPattern
} from './customValidatorFunctions';
import { ICatalogService, IValidationError } from '../application';
import { IValidationConstraints } from './validationConstraints';

moment.locale('de');

export interface IValidator {
    validateSample(sample: ISample, constraintSet: IValidationConstraints): IValidationErrorCollection;
}

export interface IValidationErrorCollection {
    [key: string]: IValidationError[];
}

export interface IValidatorConfig {
    dateFormat: string;
    dateTimeFormat: string;
    catalogService: ICatalogService;
}

class SampleValidator implements IValidator {

    private catalogService: ICatalogService;

    constructor(config: IValidatorConfig) {

        // Before using it we must add the parse and format functions
        // Here is a sample implementation using moment.js
        validate.extend(validate.validators.datetime, {
            // The value is guaranteed not to be null or undefined but otherwise it
            // could be anything.
            // tslint:disable-next-line
            parse: function (value: any, options: any) {
                const result = +moment.utc(value, config.dateFormat);
                return result;
            },
            // Input is a unix timestamp
            // tslint:disable-next-line
            format: function (value: any, options: any) {
                let format = options.dateOnly ? config.dateFormat : config.dateTimeFormat; // "DD-MM-YYYY" : "DD-MM-YYYY hh:mm:ss";
                const result = moment.utc(value).format(format);
                return result;
            }
        });
        this.catalogService = config.catalogService;
        this.registerCustomValidators();
    }

    validateSample(sample: ISample, constraintSet: IValidationConstraints): IValidationErrorCollection {
        return validate(sample.getData(), constraintSet);
    }

    private registerCustomValidators() {
        // Register Custom Validators
        validate.validators.futureDate = referenceDate;
        validate.validators.oldSample = referenceDate;
        validate.validators.atLeastOneOf = atLeastOneOf;
        validate.validators.dateAllowEmpty = dateAllowEmpty;
        validate.validators.referenceDate = referenceDate;
        validate.validators.timeBetween = referenceDate;
        validate.validators.dependentFields = dependentFields;
        validate.validators.dependentFieldEntry = dependentFieldEntry;
        validate.validators.numbersOnly = numbersOnly;
        validate.validators.matchesRegexPattern = matchesRegexPattern;
        validate.validators.inCatalog = inCatalog(this.catalogService);
        validate.validators.matchADVNumberOrString = matchADVNumberOrString(this.catalogService);
        validate.validators.registeredZoMo = registeredZoMo(this.catalogService);
        validate.validators.nonUniqueEntry = nonUniqueEntry(this.catalogService);
    }

}

function createValidator(config: IValidatorConfig): IValidator {
    return new SampleValidator(config);
}

export {
    createValidator
};
