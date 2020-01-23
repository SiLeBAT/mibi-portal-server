import * as _ from 'lodash';
import { logger } from '../../../aspects';
import {
    FormValidatorService,
    Validator,
    AVVFormatProvider,
    ValidationErrorProvider,
    ValidationOptions,
    ValidationConstraints,
    ValidationRuleSet,
    ValidationRule
} from '../model/validation.model';
import { CatalogService } from '../model/catalog.model';
import { createValidator } from '../domain/validator.entity';
import { Sample, SampleProperty } from '../model/sample.model';
import {
    baseConstraints,
    zoMoConstraints,
    standardConstraints
} from '../domain/validation-constraints';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

enum ConstraintSet {
    STANDARD = 'standard',
    ZOMO = 'ZoMo'
}

interface DuplicateIdConfig {
    sampleId: SampleProperty;
    error: number;
    uniqueIdSelector: (sample: Sample) => string | undefined;
}

const duplicatePathogenIdConfig: DuplicateIdConfig = {
    sampleId: 'sample_id',
    error: 3,
    uniqueIdSelector: (sample: Sample) => sample.pathogenId
};

const duplicatePathogenIdAVVConfig: DuplicateIdConfig = {
    sampleId: 'sample_id_avv',
    error: 6,
    uniqueIdSelector: (sample: Sample) => sample.pathogenIdAVV
};

@injectable()
export class DefaultFormValidatorService implements FormValidatorService {
    private validator: Validator;

    constructor(
        @inject(APPLICATION_TYPES.CatalogService)
        private catalogService: CatalogService,
        @inject(APPLICATION_TYPES.AVVFormatProvider)
        private avvFormatProvider: AVVFormatProvider,
        @inject(APPLICATION_TYPES.ValidationErrorProvider)
        private validationErrorProvider: ValidationErrorProvider
    ) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    async validateSamples(
        sampleCollection: Sample[],
        validationOptions: ValidationOptions
    ): Promise<Sample[]> {
        logger.verbose(
            `${this.constructor.name}.${
                this.validateSamples.name
            }, starting Sample validation`
        );

        let results = this.validateIndividualSamples(
            sampleCollection,
            validationOptions
        );
        if (results.length > 1) {
            results = this.validateSamplesBatch(results);
        }

        logger.info(
            `${this.constructor.name}.${
                this.validateSamples.name
            }, finishing Sample validation`
        );
        sampleCollection = results;
        return sampleCollection;
    }

    private validateIndividualSamples(
        samples: Sample[],
        validationOptions: ValidationOptions
    ): Sample[] {
        return samples.map(sample => {
            const constraintSet = sample.isZoMo()
                ? this.getConstraints(ConstraintSet.ZOMO, validationOptions)
                : this.getConstraints(
                      ConstraintSet.STANDARD,
                      validationOptions
                  );
            const validationErrors = this.validator.validateSample(
                sample,
                constraintSet
            );
            sample.addErrors(validationErrors);
            return sample;
        });
    }

    private validateSamplesBatch(samples: Sample[]): Sample[] {
        const checkedForDuplicateIds = this.checkForDuplicateIdEntries(
            samples,
            duplicatePathogenIdConfig
        );
        return this.checkForDuplicateIdEntries(
            checkedForDuplicateIds,
            duplicatePathogenIdAVVConfig
        );
    }

    private checkForDuplicateIdEntries(
        samples: Sample[],
        config: DuplicateIdConfig
    ): Sample[] {
        const pathogenArrayIdDuplicates = this.getDuplicateEntries(
            samples,
            config
        );

        _.filter(samples, sample =>
            _.includes(
                pathogenArrayIdDuplicates,
                config.uniqueIdSelector(sample)
            )
        ).forEach(filteredSample => {
            const err = this.validationErrorProvider.getError(config.error);
            filteredSample.addErrorTo(config.sampleId, err);
        });

        return [...samples];
    }

    private getDuplicateEntries(samples: Sample[], config: DuplicateIdConfig) {
        const pathogenArrayId = samples
            .map(sample => config.uniqueIdSelector(sample))
            .filter(x => x);
        return _.filter(pathogenArrayId, (value, index, iteratee) => {
            return _.includes(iteratee, value, index + 1);
        });
    }

    private getConstraints(set: ConstraintSet, options: ValidationOptions) {
        let newConstraints: ValidationConstraints =
            _.cloneDeep(baseConstraints) || {};

        switch (set) {
            case ConstraintSet.ZOMO:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (zoMoConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = {
                            ...value,
                            ...zoMoConstraints[key]
                        };
                    }
                });
                break;
            case ConstraintSet.STANDARD:
            default:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (standardConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = {
                            ...value,
                            ...standardConstraints[key]
                        };
                    }
                });
        }

        newConstraints = this.setStateSpecificConstraints(
            newConstraints,
            options
        );

        _.forEach(newConstraints, (v: ValidationRuleSet, k) => {
            _.forEach(v, (v2: ValidationRule, k2) => {
                v2['message'] = this.validationErrorProvider.getError(
                    v2['error']
                );
            });
        });
        return newConstraints;
    }

    private setStateSpecificConstraints(
        newConstraints: ValidationConstraints,
        options: ValidationOptions
    ): ValidationConstraints {
        if (
            newConstraints['sample_id_avv'] &&
            newConstraints['sample_id_avv']['matchesIdToSpecificYear']
        ) {
            // Necessary because of Ticket #49
            newConstraints['sample_id_avv'][
                'matchesIdToSpecificYear'
            ].regex = this.avvFormatProvider.getFormat(options.state);
        }
        return { ...newConstraints };
    }
}
