import { Sample } from './sample.model';

export interface NRLPort {
    assignNRLsToSamples(samples: Sample[]): Sample[];
}

export interface NRLService extends NRLPort {
    getSelectorsForNRL(nrl?: string): RegExp[];
}
