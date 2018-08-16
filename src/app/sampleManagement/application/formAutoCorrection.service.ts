import { ICatalogService } from '.';
import { logger } from './../../../aspects';
import { ISampleCollection } from './../domain';
import { ICorrectionFunction, autoCorrectPathogen } from '../domain/customAutoCorrectionFunctions';

export interface IFormAutoCorrectionPort {
    applyAutoCorrection(sampleCollection: ISampleCollection): ISampleCollection;
}

export interface IFormAutoCorrectionService extends IFormAutoCorrectionPort { }

class FormAutoCorrectionService implements IFormAutoCorrectionService {

    private correctionFunctions: ICorrectionFunction[] = [];

    constructor(private catalogService: ICatalogService) {
        this.registerCorrectionFunctions();
    }

    applyAutoCorrection(sampleCollection: ISampleCollection): ISampleCollection {

        logger.verbose('FormAutoCorrectionService.applyAutoCorrection, Starting Sample autoCorrection');
        const results = sampleCollection.samples.map(sample => {
            this.correctionFunctions.forEach(fn => {
                const correction = fn(sample);
                if (correction) {
                    sample.autoCorrections.push(correction);
                    sample.correctField(correction.field, correction.corrected);
                }
            });
            return sample;
        });
        logger.info('Finishing Sample autoCorrection');
        sampleCollection.samples = results;
        return sampleCollection;

    }

    private registerCorrectionFunctions() {
        this.correctionFunctions.push(autoCorrectPathogen(this.catalogService));
    }
}

export function createService(catalogService: ICatalogService): IFormAutoCorrectionService {
    return new FormAutoCorrectionService(catalogService);
}
