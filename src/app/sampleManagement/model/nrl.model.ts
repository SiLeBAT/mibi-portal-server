import { Sample } from './sample.model';
import { NRL } from '../domain/enums';

export interface NRLConstants {
    readonly longNames: Record<NRL, string>;
}

export interface NRLPort {
    assignNRLsToSamples(samples: Sample[]): Sample[];
}

export interface NRLService extends NRLPort {
    getEmailForNRL(nrl: NRL): string;
}
