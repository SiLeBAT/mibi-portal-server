import * as _ from 'lodash';
import { ICatalogService, ValidationErrorProvider } from '.';
import { logger } from '../../../aspects';
import { SampleCollection, Sample } from '../domain';
import { CorrectionFunction, autoCorrectADV16, autoCorrectADV9, autoCorrectADV8, autoCorrectADV12, autoCorrectADV3, autoCorrectADV2 } from '../domain/custom-auto-correction-functions';

export interface IFormAutoCorrectionPort {
    applyAutoCorrection(sampleCollection: SampleCollection): Promise<SampleCollection>;
}

export interface IFormAutoCorrectionService extends IFormAutoCorrectionPort { }

class FormAutoCorrectionService implements IFormAutoCorrectionService {

    private correctionFunctions: CorrectionFunction[] = [];

    constructor(private catalogService: ICatalogService, private validationErrorProvider: ValidationErrorProvider) {
        this.registerCorrectionFunctions();
    }

    async applyAutoCorrection(sampleCollection: SampleCollection): Promise<SampleCollection> {

        logger.verbose('FormAutoCorrectionService.applyAutoCorrection, Starting Sample autoCorrection');

        let results = sampleCollection.samples.map(sample => {
            const newSample: Sample = sample.clone();
            this.correctionFunctions.forEach(fn => {
                const correction = fn(newSample.getData());
                if (correction) {
                    newSample.correctionSuggestions.push(correction);
                    if (correction.code) {
                        const err = this.validationErrorProvider.getError(correction.code);
                        newSample.addErrorTo(correction.field, err);
                    }
                }
            });
            return newSample;
        });
        results = this.resolveSingleAutoCorrectionOffers(results);
        logger.info('Finishing Sample autoCorrection');
        return { samples: results };
    }

    private resolveSingleAutoCorrectionOffers(samples: Sample[]): Sample[] {
        for (let sample of samples) {
            const singleCorrections = _.remove(sample.correctionSuggestions, c => c.correctionOffer.length === 1);
            for (let ac of singleCorrections) {
                const data = sample.getData();
                sample.edits[ac.field] = data[ac.field];
                data[ac.field] = ac.correctionOffer[0];
            }
        }
        return samples;
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

export function createService(catalogService: ICatalogService, validationErrorProvider: ValidationErrorProvider): IFormAutoCorrectionService {
    return new FormAutoCorrectionService(catalogService, validationErrorProvider);
}
