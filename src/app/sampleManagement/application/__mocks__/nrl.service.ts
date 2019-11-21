import { Sample } from './../../model/sample.model';
import { NRL_ID } from './../../domain/enums';

export function getMockNRLService() {
    return {
        assignNRLsToSamples(samples: Sample[]) {
            return [];
        },
        retrieveNRLs() {
            return Promise.resolve([]);
        },
        getEmailForNRL(nrl: NRL_ID) {
            return '';
        },
        getNRLForPathogen(pathogen: string) {
            return NRL_ID.UNKNOWN;
        },
        getOptionalAnalysisFor(nrl: NRL_ID) {
            return {};
        },
        getStandardAnalysisFor(nrl: NRL_ID) {
            return {};
        }
    };
}
