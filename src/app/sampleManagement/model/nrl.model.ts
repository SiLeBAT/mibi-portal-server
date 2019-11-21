import { Sample, Analysis } from './sample.model';
import { NRL_ID } from '../domain/enums';

export interface NRLConstants {
    readonly longNames: Record<NRL_ID, string>;
}

export interface NRL {
    selectors: string[];
    id: NRL_ID;
    email: string;
    standardProcedures: AnalysisProcedure[];
    optionalProcedures: AnalysisProcedure[];
}

interface AnalysisProcedure {
    value: string;
    key: number;
}
export interface NRLPort {
    assignNRLsToSamples(samples: Sample[]): Sample[];
    retrieveNRLs(): Promise<NRL[]>;
}

export interface NRLService extends NRLPort {
    getEmailForNRL(nrl: NRL_ID): string;
    getNRLForPathogen(pathogen: string): NRL_ID;
    getOptionalAnalysisFor(nrl: NRL_ID): Partial<Analysis>;
    getStandardAnalysisFor(nrl: NRL_ID): Partial<Analysis>;
}
