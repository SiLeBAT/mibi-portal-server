import * as _ from 'lodash';
import { logger } from '../../../aspects';
import { ICatalogService, IAVVFormatProvider, ValidationErrorProvider, INRLSelectorProvider } from '.';
import { ApplicationDomainError } from '../../sharedKernel';
import {
    Sample,
    SampleCollection,
    createValidator,
    Validator,
    ConstraintSet, ValidationConstraints, ValidationRuleSet, baseConstraints, zoMoConstraints, standardConstraints, ValidationRule
} from '../domain';

export interface ValidationOptions {
    state?: string;
    nrl?: string;
    year?: string;
}
export interface FormValidatorPort {
    validateSamples(sampleCollection: SampleCollection, validationOptions: ValidationOptions): Promise<SampleCollection>;
}

export interface FormValidatorService extends FormValidatorPort { }

class DefaultFormValidatorService implements FormValidatorService {

    private validator: Validator;

    constructor(private catalogService: ICatalogService, private avvFormatProvider: IAVVFormatProvider, private validationErrorProvider: ValidationErrorProvider, private nrlSelectorProvider: INRLSelectorProvider) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    // TODO: Needs to be refactored & tested
    async validateSamples(sampleCollection: SampleCollection, validationOptions: ValidationOptions): Promise<SampleCollection> {

        logger.verbose('FormValidatorService.validateSamples, Starting Sample validation');

        let results = this.validateIndividualSamples(sampleCollection.samples, validationOptions);
        if (results.length > 1) {
            results = this.validateSamplesBatch(results);
        }

        logger.info('Finishing Sample validation');
        sampleCollection.samples = results;
        return sampleCollection;

    }

    private validateIndividualSamples(samples: Sample[], validationOptions: ValidationOptions): Sample[] {
        return samples.map(sample => {
            const constraintSet = sample.isZoMo() ? this.getConstraints(ConstraintSet.ZOMO, validationOptions) : this.getConstraints(ConstraintSet.STANDARD, validationOptions);
            const validationErrors = this.validator.validateSample(sample, constraintSet);
            sample.addErrors(validationErrors);
            return sample;
        });
    }

    private validateSamplesBatch(samples: Sample[]): Sample[] {
        const checkedForDuplicateIds = this.checkForDuplicateIdEntries(samples, 'pathogenId');
        return this.checkForDuplicateIdEntries(checkedForDuplicateIds, 'pathogenIdAVV');
    }

    private checkForDuplicateIdEntries(samples: Sample[], uniqueId: keyof Sample): Sample[] {
        const config = this.getUniqueIdErrorConfig(uniqueId);

        const pathogenArrayIdDuplicates = this.getDuplicateEntries(samples, uniqueId);

        _.filter(samples, sample => _.includes(pathogenArrayIdDuplicates, sample[uniqueId]))
            .forEach(e => {
                e.addErrorTo(config.sampleId, this.validationErrorProvider.getError(config.error));
            });

        return [...samples];
    }

    private getDuplicateEntries(samples: Sample[], uniqueId: keyof Sample) {
        const pathogenArrayId = samples.map(sample => sample[uniqueId]).filter(x => x);
        return _.filter(pathogenArrayId, function (value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });
    }

    private getUniqueIdErrorConfig(uniqueId: string) {

        switch (uniqueId) {
            case 'pathogenId':
                return {
                    sampleId: 'sample_id',
                    error: 3
                };
            case 'pathogenIdAVV':
                return {
                    sampleId: 'sample_id_avv',
                    error: 6
                };
            default:
                throw new ApplicationDomainError(`Invalid Input: This unique ID is not validated uniqueId=${uniqueId}`);
        }

    }

    private getConstraints(set: ConstraintSet, options: ValidationOptions) {
        let newConstraints: ValidationConstraints = _.cloneDeep(baseConstraints);

        switch (set) {
            case ConstraintSet.ZOMO:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (zoMoConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = { ...value, ...zoMoConstraints[key] };
                    }
                });
                break;
            case ConstraintSet.STANDARD:
            default:
                _.forEach(newConstraints, (value: ValidationRuleSet, key) => {
                    if (standardConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = { ...value, ...standardConstraints[key] };
                    }
                });
        }

        newConstraints = this.setStateSpecificConstraints(newConstraints, options);
        newConstraints = this.setNRLConstraints(newConstraints, options);

        _.forEach(newConstraints, (v: ValidationRuleSet, k) => {
            _.forEach(v, (v2: ValidationRule, k2) => {
                v2['message'] = this.validationErrorProvider.getError(v2['error']);
            });
        });
        return newConstraints;
    }

    private setStateSpecificConstraints(newConstraints: ValidationConstraints, options: ValidationOptions): ValidationConstraints {
        if (newConstraints['sample_id_avv'] && newConstraints['sample_id_avv']['matchesIdToSpecificYear']) {
            // Necessary because of Ticket #49
            newConstraints['sample_id_avv']['matchesIdToSpecificYear'].regex = this.avvFormatProvider.getFormat(options.state);
        }
        return { ...newConstraints };
    }

    private setNRLConstraints(newConstraints: ValidationConstraints, options: ValidationOptions): ValidationConstraints {
        if (newConstraints['pathogen_adv'] && newConstraints['pathogen_adv']['matchesRegexPattern']) {
            // Necessary because of Ticket #54
            newConstraints['pathogen_adv']['matchesRegexPattern'].regex = this.nrlSelectorProvider.getSelectors(options.nrl);
        }
        switch (options.nrl) {
            case 'NRL-AR':
                newConstraints['sampling_reason_adv'] = newConstraints['sampling_reason_adv'] || {};
                newConstraints['sampling_reason_adv']['exclusion'] = {
                    error: 95,
                    within: [10, '10', 'Planprobe']
                };
                newConstraints['sampling_reason_text'] = newConstraints['sampling_reason_text'] || {};
                newConstraints['sampling_reason_text']['exclusion'] = {
                    error: 95,
                    within: [10, 'Planprobe', '10']
                };
                break;
            default:
        }
        return { ...newConstraints };
    }
}

export function createService(catalogService: ICatalogService, avvFormatProvider: IAVVFormatProvider, validationErrorProvider: ValidationErrorProvider, nrlSelectorProvider: INRLSelectorProvider): FormValidatorService {
    return new DefaultFormValidatorService(catalogService, avvFormatProvider, validationErrorProvider, nrlSelectorProvider);
}
