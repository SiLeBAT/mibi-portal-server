import * as _ from 'lodash';
import { logger } from '../../../aspects';
import { ICatalogService, IAVVFormatProvider, IValidationErrorProvider, INRLSelectorProvider } from '.';
import { ApplicationDomainError } from '../../sharedKernel';
import {
    Sample,
    ISampleCollection,
    createValidator,
    IValidator,
    ConstraintSet, IValidationConstraints, IValidationRuleSet, baseConstraints, zoMoConstraints, standardConstraints, IValidationRule
} from '../domain';

export interface IValidationOptions {
    state?: string;
    nrl?: string;
    year?: string;
}
export interface IFormValidatorPort {
    validateSamples(sampleCollection: ISampleCollection, validationOptions: IValidationOptions): Promise<ISampleCollection>;
}

export interface IFormValidatorService extends IFormValidatorPort { }

class FormValidatorService implements IFormValidatorService {

    private validator: IValidator;

    constructor(private catalogService: ICatalogService, private avvFormatProvider: IAVVFormatProvider, private validationErrorProvider: IValidationErrorProvider, private nrlSelectorProvider: INRLSelectorProvider) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    // TODO: Needs to be refactored & tested
    async validateSamples(sampleCollection: ISampleCollection, validationOptions: IValidationOptions): Promise<ISampleCollection> {

        logger.verbose('FormValidatorService.validateSamples, Starting Sample validation');

        const results = sampleCollection.samples.map(sample => {
            const constraintSet = sample.isZoMo() ? this.getConstraints(ConstraintSet.ZOMO, validationOptions) : this.getConstraints(ConstraintSet.STANDARD, validationOptions);
            const validationErrors = this.validator.validateSample(sample, constraintSet);
            sample.addErrors(validationErrors);
            return sample;
        });

        const checkedForDuplicateIds = this.checkForDuplicateId(results, 'pathogenId');
        const allChecked = this.checkForDuplicateId(checkedForDuplicateIds, 'pathogenIdAVV');
        logger.info('Finishing Sample validation');
        sampleCollection.samples = allChecked;
        return sampleCollection;

    }

    private checkForDuplicateId(samples: Sample[], uniqueId: keyof Sample): Sample[] {
        const config = this.getUniqueIdErrorConfig(uniqueId);
        const pathogenArrayId = samples.map(sample => sample[uniqueId]).filter(x => x);
        const pathogenArrayIdDuplicates = _.filter(pathogenArrayId, function (value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });
        _.filter(samples, sample => _.includes(pathogenArrayIdDuplicates, sample[uniqueId]))
            .forEach(e => {
                e.addErrorTo(config.sampleId, this.validationErrorProvider.getError(config.error));
            });

        return [...samples];
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

    private getConstraints(set: ConstraintSet, options: IValidationOptions) {
        const newConstraints: IValidationConstraints = { ...baseConstraints };
        // Necessary because of Ticket #49
        newConstraints['sample_id_avv']['matchesIdToSpecificYear'].regex = this.avvFormatProvider.getFormat(options.state);
        // Necessary because of Ticket #54
        newConstraints['pathogen_adv']['matchesRegexPattern'].regex = this.nrlSelectorProvider.getSelectors(options.nrl);
        switch (set) {
            case ConstraintSet.ZOMO:
                _.forEach(newConstraints, (value: IValidationRuleSet, key) => {
                    if (zoMoConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = { ...value, ...zoMoConstraints[key] };
                    }
                });
                break;
            case ConstraintSet.STANDARD:
            default:
                _.forEach(newConstraints, (value: IValidationRuleSet, key) => {
                    if (standardConstraints.hasOwnProperty(key)) {
                        newConstraints[key] = { ...value, ...standardConstraints[key] };
                    }
                });
        }
        _.forEach(newConstraints, (v: IValidationRuleSet, k) => {
            _.forEach(v, (v2: IValidationRule, k2) => {
                v2['message'] = this.validationErrorProvider.getError(v2['error']);
            });
        });
        return newConstraints;
    }
}

export function createService(catalogService: ICatalogService, avvFormatProvider: IAVVFormatProvider, validationErrorProvider: IValidationErrorProvider, nrlSelectorProvider: INRLSelectorProvider): IFormValidatorService {
    return new FormValidatorService(catalogService, avvFormatProvider, validationErrorProvider, nrlSelectorProvider);
}
