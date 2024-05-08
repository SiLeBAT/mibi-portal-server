import _ from 'lodash';
import { logger } from '../../../aspects';
import {
    autoCorrectAVV324,
    autoCorrectAVV319,
    autoCorrectAVV339,
    autoCorrectAVV303
} from '../domain/custom-auto-correction-functions';
import {
    CorrectionFunction,
    FormAutoCorrectionService,
    CorrectionSuggestions
} from '../model/autocorrection.model';
import { CatalogService } from '../model/catalog.model';
import { ValidationErrorProvider } from '../model/validation.model';
import { Sample, SampleData } from '../model/sample.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultFormAutoCorrectionService
    implements FormAutoCorrectionService
{
    private correctionFunctions: CorrectionFunction[] = [];

    constructor(
        @inject(APPLICATION_TYPES.CatalogService)
        private catalogService: CatalogService,
        @inject(APPLICATION_TYPES.ValidationErrorProvider)
        private validationErrorProvider: ValidationErrorProvider
    ) {
        this.registerCorrectionFunctions();
    }

    async applyAutoCorrection(sampleCollection: Sample[]): Promise<Sample[]> {
        logger.verbose(
            `${this.constructor.name}.${this.applyAutoCorrection.name}, starting Sample autoCorrection`
        );

        let results = sampleCollection.map(sample => {
            const newSample: Sample = sample.clone();
            const sampleData: SampleData = newSample.getAnnotatedData();
            this.correctionFunctions.forEach(fn => {
                const correction: CorrectionSuggestions | null = fn(sampleData);
                if (correction) {
                    const targetField = correction.field.toString();
                    newSample.addCorrectionTo(
                        targetField,
                        correction.correctionOffer
                    );
                    if (correction.code) {
                        const err = this.validationErrorProvider.getError(
                            correction.code
                        );
                        newSample.addErrorTo(targetField, err);
                    }
                    newSample.applySingleCorrectionSuggestions();
                }
            });
            return newSample;
        });
        logger.info(
            `${this.constructor.name}.${this.applyAutoCorrection.name}, finishing Sample autoCorrection`
        );
        return results;
    }

    private registerCorrectionFunctions() {
        this.correctionFunctions.push(autoCorrectAVV324(this.catalogService));
        this.correctionFunctions.push(autoCorrectAVV319(this.catalogService));
        this.correctionFunctions.push(autoCorrectAVV339(this.catalogService));
        this.correctionFunctions.push(autoCorrectAVV303(this.catalogService));
    }
}
