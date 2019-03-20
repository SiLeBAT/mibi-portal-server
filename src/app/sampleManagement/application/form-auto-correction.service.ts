import * as _ from 'lodash';
import { logger } from '../../../aspects';
import {
    autoCorrectADV16,
    autoCorrectADV9,
    autoCorrectADV8,
    autoCorrectADV12,
    autoCorrectADV3,
    autoCorrectADV2
} from '../domain/custom-auto-correction-functions';
import {
    CorrectionFunction,
    FormAutoCorrectionService
} from '../model/autocorrection.model';
import { CatalogService } from '../model/catalog.model';
import { ValidationErrorProvider } from '../model/validation.model';
import { SampleCollection, Sample } from '../model/sample.model';

class DefaultFormAutoCorrectionService implements FormAutoCorrectionService {
    private correctionFunctions: CorrectionFunction[] = [];

    constructor(
        private catalogService: CatalogService,
        private validationErrorProvider: ValidationErrorProvider
    ) {
        this.registerCorrectionFunctions();
    }

    async applyAutoCorrection(
        sampleCollection: SampleCollection
    ): Promise<SampleCollection> {
        logger.verbose(
            'FormAutoCorrectionService.applyAutoCorrection, Starting Sample autoCorrection'
        );

        let results = sampleCollection.samples.map(sample => {
            const newSample: Sample = sample.clone();
            this.correctionFunctions.forEach(fn => {
                const correction = fn(newSample.getData());
                if (correction) {
                    newSample.correctionSuggestions.push(correction);
                    if (correction.code) {
                        const err = this.validationErrorProvider.getError(
                            correction.code
                        );
                        newSample.addErrorTo(correction.field, err);
                    }
                    // Resolve single suggestion corrections
                    const singleCorrections = _.remove(
                        newSample.correctionSuggestions,
                        c => c.correctionOffer.length === 1
                    );
                    for (let ac of singleCorrections) {
                        const data = newSample.getData();
                        newSample.edits[ac.field] = data[ac.field];
                        data[ac.field] = ac.correctionOffer[0];
                    }
                }
            });
            return newSample;
        });
        logger.info('Finishing Sample autoCorrection');
        return { samples: results };
    }

    private registerCorrectionFunctions() {
        this.correctionFunctions.push(autoCorrectADV16(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV9(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV8(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV3(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV12(this.catalogService));
        this.correctionFunctions.push(autoCorrectADV2(this.catalogService));
    }
}

export function createService(
    catalogService: CatalogService,
    validationErrorProvider: ValidationErrorProvider
): FormAutoCorrectionService {
    return new DefaultFormAutoCorrectionService(
        catalogService,
        validationErrorProvider
    );
}
