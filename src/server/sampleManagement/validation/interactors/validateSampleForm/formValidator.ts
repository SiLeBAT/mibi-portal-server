import * as _ from 'lodash';

import { logger } from './../../../../../aspects';
import { ISampleData, validateSample, initialize, IValidationErrorCollection } from "../../entities/validation";
import { getCatalog } from './../provideCatalogData';
import { ISample } from './sample';
import { ServerError } from './../../../../../aspects';

initialize({
    dateFormat: "DD-MM-YYYY",
    dateTimeFormat: "DD-MM-YYYY hh:mm:ss",
    catalogProvider: getCatalog
})


function validateSamples(samples: ISample[]): ISample[] {
    logger.info("Starting Sample validation");

    const results = samples.map(s => {
        s.errors = validateSample(s.data) || {};
        s.id_pathogen = (s.data.sample_id + s.data.pathogen_adv + s.data.pathogen_text).replace(/\s+/g, '');
        s.id_avv_pathogen = (s.data.sample_id_avv + s.data.pathogen_adv + s.data.pathogen_text).replace(/\s+/g, '');
        return s;
    });

    const checkedForDuplicateIds = checkForDuplicateId(results, 'id_pathogen');
    const allChecked = checkForDuplicateId(checkedForDuplicateIds, 'id_avv_pathogen');
    logger.info("Finishing Sample validation");
    return allChecked;

}

function checkForDuplicateId(samples: ISample[], uniqueId: string): ISample[] {
    const config = getUniqueIdErrorConfig(uniqueId);
    const id_pathogenArray = samples.map(s => s[uniqueId]);
    const id_pathogenArray_duplicates = _.filter(id_pathogenArray, function (value, index, iteratee) {
        return _.includes(iteratee, value, index + 1);
    });

    _.filter(samples, s => _.includes(id_pathogenArray_duplicates, s[uniqueId]))
        .forEach(e => {
            if (!e.errors[config.sampleId]) {
                e.errors[config.sampleId] = [];
            }
            e.errors[config.sampleId].push(config.error)
        });

    return [...samples];
}

function getUniqueIdErrorConfig(uniqueId: string) {

    switch (uniqueId) {
        case 'id_pathogen':
            return {
                sampleId: 'sample_id',
                error: {
                    code: 3,
                    id: "3",
                    level: 2,
                    message: "Probenummer kommt mehrfach vor (bei identischem Erreger)"
                }
            }
        case 'id_avv_pathogen':
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