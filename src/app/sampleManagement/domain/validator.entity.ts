import * as validate from 'validate.js';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Sample } from '../';
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
    matchesRegexPattern,
    matchesIdToSpecificYear
} from './custom-validator-functions';
import { ICatalogService, ValidationError } from '../application';
import { ValidationConstraints } from './validation-constraints';

moment.locale('de');

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
    catalogService: ICatalogService;
}

class SampleValidator implements Validator {
    private catalogService: ICatalogService;

    constructor(config: ValidatorConfig) {
        // Before using it we must add the parse and format functions
        // Here is a sample implementation using moment.js
        validate.extend(validate.validators.datetime, {
            // The value is guaranteed not to be null or undefined but otherwise it
            // could be anything.
            // tslint:disable-next-line
            parse: function(value: any, options: any) {
                const result = +moment.utc(value, config.dateFormat);
                return result;
            },
            // Input is a unix timestamp
            // tslint:disable-next-line
            format: function(value: any, options: any) {
                let format = options.dateOnly
                    ? config.dateFormat
                    : config.dateTimeFormat; // "DD-MM-YYYY" : "DD-MM-YYYY hh:mm:ss";
                const result = moment.utc(value).format(format);
                return result;
            }
        });
        this.catalogService = config.catalogService;
        this.registerCustomValidators();
    }

    validateSample(
        sample: Sample,
        constraintSet: ValidationConstraints
    ): ValidationErrorCollection {
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
        validate.validators.matchesIdToSpecificYear = matchesIdToSpecificYear;
        validate.validators.inCatalog = inCatalog(this.catalogService);
        validate.validators.matchADVNumberOrString = matchADVNumberOrString(
            this.catalogService
        );
        validate.validators.registeredZoMo = registeredZoMo(
            this.catalogService
        );
        validate.validators.nonUniqueEntry = nonUniqueEntry(
            this.catalogService
        );
    }
}

function createValidator(config: ValidatorConfig): Validator {
    return new SampleValidator(config);
}

export { createValidator };
