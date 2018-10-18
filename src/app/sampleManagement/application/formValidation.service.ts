import * as _ from 'lodash';
import { logger } from './../../../aspects';
import { ISample, ISampleCollection, createValidator, IValidator, ConstraintSet } from './../domain';
import { ICatalogService } from '.';
import { ApplicationDomainError } from '../../sharedKernel/errors';
import { IValidationConstraints, IValidationRuleSet, baseConstraints, zoMoConstraints, standardConstraints } from '../domain/validationConstraints';
import { IAVVFormatProvider } from './avvFormatProvider.service';

export interface IFormValidatorPort {
    validateSamples(sampleCollection: ISampleCollection, state?: string): ISampleCollection;
}

export interface IFormValidatorService extends IFormValidatorPort { }

class FormValidatorService implements IFormValidatorService {

    private validator: IValidator;

    constructor(private catalogService: ICatalogService, private avvFormatProvider: IAVVFormatProvider) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    // TODO: Needs to be refactored & tested
    validateSamples(sampleCollection: ISampleCollection, state: string = ''): ISampleCollection {

        logger.verbose('FormValidatorService.validateSamples, Starting Sample validation');

        const results = sampleCollection.samples.map(sample => {
            const constraintSet = sample.isZoMo() ? this.getConstraints(ConstraintSet.ZOMO, state) : this.getConstraints(ConstraintSet.STANDARD, state);
            sample.setErrors(this.validator.validateSample(sample, constraintSet));
            return sample;
        });

        const checkedForDuplicateIds = this.checkForDuplicateId(results, 'pathogenId');
        const allChecked = this.checkForDuplicateId(checkedForDuplicateIds, 'pathogenIdAVV');
        logger.info('Finishing Sample validation');
        sampleCollection.samples = allChecked;
        return sampleCollection;

    }

    private checkForDuplicateId(samples: ISample[], uniqueId: keyof ISample): ISample[] {
        const config = this.getUniqueIdErrorConfig(uniqueId);
        const pathogenArrayId = samples.map(sample => sample[uniqueId]).filter(x => x);
        const pathogenArrayIdDuplicates = _.filter(pathogenArrayId, function (value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });
        _.filter(samples, sample => _.includes(pathogenArrayIdDuplicates, sample[uniqueId]))
            .forEach(e => {
                e.addErrorTo(config.sampleId, config.error);
            });

        return [...samples];
    }

    private getUniqueIdErrorConfig(uniqueId: string) {

        switch (uniqueId) {
            case 'pathogenId':
                return {
                    sampleId: 'sample_id',
                    error: {
                        code: 3,
                        id: '3',
                        level: 2,
                        message: 'Probenummer kommt mehrfach vor (bei identischem Erreger)'
                    }
                };
            case 'pathogenIdAVV':
                return {
                    sampleId: 'sample_id_avv',
                    error: {
                        code: 6,
                        id: '6',
                        level: 2,
                        message: 'Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)'
                    }
                };
            default:
                throw new ApplicationDomainError(`Invalid Input: This unique ID is not validated uniqueId=${uniqueId }`);
        }

    }

    private getConstraints(set: ConstraintSet, state: string) {
        const newConstraints: IValidationConstraints = { ...baseConstraints };
        // Necessary because of Ticket #49
        newConstraints['sample_id_avv']['aavDataFormat'].regex = this.avvFormatProvider.getFormat(state);
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
        return newConstraints;
    }
}

export function createService(catalogService: ICatalogService, avvFormatProvider: IAVVFormatProvider): IFormValidatorService {
    return new FormValidatorService(catalogService, avvFormatProvider);
}
