import * as _ from 'lodash';

import { logger } from './../../../../../aspects';
import { validateSample, initialize, IValidationErrorCollection } from "../../entities/validation";
import { getCatalog } from './../provideCatalogData';
import { ISample, ISampleCollection } from './../../entities';
import { ServerError } from './../../../../../aspects';

initialize({
    dateFormat: "DD-MM-YYYY",
    dateTimeFormat: "DD-MM-YYYY hh:mm:ss",
    catalogProvider: getCatalog
})


function validateSamples(sampleCollection: ISampleCollection): ISampleCollection {
    logger.verbose("Starting Sample validation");

    const results = sampleCollection.getSamples().map(s => {
        s.setErrors(validateSample(s));

        return s;
    });

    const checkedForDuplicateIds = checkForDuplicateId(results, 'pathogenId');
    const allChecked = checkForDuplicateId(checkedForDuplicateIds, 'pathogenIdAVV');
    logger.verbose("Finishing Sample validation");
    sampleCollection.setSamples(allChecked);
    return sampleCollection;

}

function checkForDuplicateId(samples: ISample[], uniqueId: string): ISample[] {
    const config = getUniqueIdErrorConfig(uniqueId);
    const id_pathogenArray = samples.map(s => s[uniqueId]);
    const id_pathogenArray_duplicates = _.filter(id_pathogenArray, function (value, index, iteratee) {
        return _.includes(iteratee, value, index + 1);
    });

    _.filter(samples, s => _.includes(id_pathogenArray_duplicates, s[uniqueId]))
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
                    id: "3",
                    level: 2,
                    message: "Probenummer kommt mehrfach vor (bei identischem Erreger)"
                }
            }
        case 'pathogenIdAVV':
            return {
                sampleId: 'sample_id_avv',
                error: {
                    code: 6,
                    id: "6",
                    level: 2,
                    message: "Probenummer nach AVVData kommt mehrfach vor (bei identischem Erreger)"
                }
            }
        default:
            throw new ServerError("Invalid Input: This unique ID is not validated.")
    }

}

export {
    validateSamples
}