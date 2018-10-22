import { ICatalogService } from '.';
import { logger } from '../../../aspects';
import { ISampleCollection, ISample } from '../domain';
import { ICorrectionFunction, autoCorrectPathogen } from '../domain/custom-auto-correction-functions';

export interface IFormAutoCorrectionPort {
    applyAutoCorrection(sampleCollection: ISampleCollection): Promise<ISampleCollection>;
}

export interface IFormAutoCorrectionService extends IFormAutoCorrectionPort { }

class FormAutoCorrectionService implements IFormAutoCorrectionService {

    private correctionFunctions: ICorrectionFunction[] = [];

    constructor(private catalogService: ICatalogService) {
        this.registerCorrectionFunctions();
    }

    async applyAutoCorrection(sampleCollection: ISampleCollection): Promise<ISampleCollection> {

        logger.verbose('FormAutoCorrectionService.applyAutoCorrection, Starting Sample autoCorrection');

        const results = sampleCollection.samples.map(sample => {
            const newSample: ISample = sample.clone();
            this.correctionFunctions.forEach(fn => {
                const correction = fn(newSample);
                if (correction) {
                    newSample.autoCorrections.push(correction);
                }
            });
            return newSample;
        });
        logger.info('Finishing Sample autoCorrection');
        return { samples: results };
    }

    private registerCorrectionFunctions() {
        this.correctionFunctions.push(autoCorrectPathogen(this.catalogService));
    }
}

export function createService(catalogService: ICatalogService): IFormAutoCorrectionService {
    return new FormAutoCorrectionService(catalogService);
}
