import { APPLICATION_TYPES } from './../../application.types';
import {
    SampleData,
    Sample,
    Analysis,
    SampleFactory
} from './../model/sample.model';
import { NRLService } from './../model/nrl.model';
import { inject, injectable } from 'inversify';
import { Urgency } from './enums';
import { DefaultSample } from './sample.entity';

@injectable()
export class DefaultSampleFactory implements SampleFactory {
    constructor(
        @inject(APPLICATION_TYPES.NRLService)
        private nrlService: NRLService
    ) {}
    createSample(data: SampleData): Sample {
        const pathogen = data['pathogen_avv'].value;
        const nrl = this.nrlService.getNRLForPathogen(pathogen);
        const defaultAnalysis: Partial<Analysis> = {
            ...this.nrlService.getStandardAnalysisFor(nrl),
            ...this.nrlService.getOptionalAnalysisFor(nrl)
        };
        return DefaultSample.create(data, {
            nrl,
            analysis: defaultAnalysis,
            urgency: Urgency.NORMAL
        });
    }
}
