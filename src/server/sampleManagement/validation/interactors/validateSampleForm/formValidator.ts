import * as _ from 'lodash';
import { logger, ServerError } from './../../../../../aspects';
import { getCatalog } from './../provideCatalogData';
import { ISample, ISampleCollection, validateSample, initialize } from './../../entities';

initialize({
    dateFormat: 'DD-MM-YYYY',
    dateTimeFormat: 'DD-MM-YYYY hh:mm:ss',
    catalogProvider: getCatalog
});

function validateSamples(sampleCollection: ISampleCollection): ISampleCollection {
    logger.verbose('Starting Sample validation');

    const results = sampleCollection.getSamples().map(s => {
        s.setErrors(validateSample(s));

        return s;
    });

    const checkedForDuplicateIds = checkForDuplicateId(results, 'pathogenId');
    const allChecked = checkForDuplicateId(checkedForDuplicateIds, 'pathogenIdAVV');
    logger.verbose('Finishing Sample validation');
    sampleCollection.setSamples(allChecked);
    return sampleCollection;

}

function checkForDuplicateId(samples: ISample[], uniqueId: string): ISample[] {
    const config = getUniqueIdErrorConfig(uniqueId);
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

function getUniqueIdErrorConfig(uniqueId: string) {

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
            throw new ServerError('Invalid Input: This unique ID is not validated.');
    }

}

export {
    validateSamples
};
