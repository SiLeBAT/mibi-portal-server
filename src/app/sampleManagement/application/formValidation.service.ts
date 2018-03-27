import * as _ from 'lodash';
import { logger } from './../../../aspects';
import { ISample, ISampleCollection, createValidator, IValidator } from './../domain';
import { ICatalogService } from '.';
import { ApplicationDomainError } from '../../sharedKernel/errors';

export interface IFormValidatorPort {
    validateSamples(sampleCollection: ISampleCollection): ISampleCollection;
}

export interface IFormValidatorService extends IFormValidatorPort { }

class FormValidatorService implements IFormValidatorService {

    private validator: IValidator;

    constructor(private catalogService: ICatalogService) {
        this.validator = createValidator({
            dateFormat: 'DD-MM-YYYY',
            dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
            catalogService: this.catalogService
        });
    }

    // TODO: Needs to be refactored & tested
    validateSamples(sampleCollection: ISampleCollection): ISampleCollection {

        logger.verbose('Starting Sample validation');

        const results = sampleCollection.samples.map(s => {
            s.setErrors(this.validator.validateSample(s));
            return s;
        });

        const checkedForDuplicateIds = this.checkForDuplicateId(results, 'pathogenId');
        const allChecked = this.checkForDuplicateId(checkedForDuplicateIds, 'pathogenIdAVV');
        logger.info('Finishing Sample validation');
        sampleCollection.samples = allChecked;
        return sampleCollection;

    }

    private checkForDuplicateId(samples: ISample[], uniqueId: string): ISample[] {
        const config = this.getUniqueIdErrorConfig(uniqueId);
        // tslint:disable-next-line
        const pathogenArrayId = samples.map(s => (s as any)[uniqueId]);
        const pathogenArrayIdDuplicates = _.filter(pathogenArrayId, function (value, index, iteratee) {
            return _.includes(iteratee, value, index + 1);
        });
        // tslint:disable-next-line
        _.filter(samples, s => _.includes(pathogenArrayIdDuplicates, (s as any)[uniqueId]))
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
}

export function createService(catalogService: ICatalogService): IFormValidatorService {
    return new FormValidatorService(catalogService);
}
