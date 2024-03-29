import { Analysis } from './../model/sample.model';
import { NRL_ID } from './../domain/enums';
import { ApplicationDomainError } from './../../core/domain/domain.error';
import { Sample } from '../model/sample.model';
import { NRLService, NRL } from '../model/nrl.model';
import _ from 'lodash';
import { logger } from '../../../aspects';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from '../../application.types';
import { ParseNRLRepository } from '../model/repository.model';

@injectable()
export class DefaultNRLService implements NRLService {
    static mapNRLStringToEnum(nrlString: string): NRL_ID {
        switch (nrlString.trim()) {
            case 'Konsiliarlabor für Vibrionen':
            case 'KL-Vibrio':
                return NRL_ID.KL_Vibrio;
            case 'NRL für Escherichia coli einschließl. verotoxinbildende E. coli':
            case 'NRL-VTEC':
                return NRL_ID.NRL_VTEC;
            case 'Labor für Sporenbildner, Bacillus spp.':
            case 'L-Bacillus':
                return NRL_ID.L_Bacillus;
            case 'Labor für Sporenbildner, Clostridium spp.':
            case 'L-Clostridium':
                return NRL_ID.L_Clostridium;
            case 'NRL für koagulasepositive Staphylokokken einschl. Staphylococcus aureus':
            case 'NRL-Staph':
                return NRL_ID.NRL_Staph;
            case 'NRL für Salmonella':
            case 'NRL-Salm':
                return NRL_ID.NRL_Salm;
            case 'NRL für Listeria monocytogenes':
            case 'NRL-Listeria':
                return NRL_ID.NRL_Listeria;
            case 'NRL für Campylobacter':
            case 'NRL-Campy':
                return NRL_ID.NRL_Campy;
            case 'NRL für Antibiotikaresistenz':
            case 'NRL-AR':
                return NRL_ID.NRL_AR;
            case 'Konsiliarlabor für Yersinia':
            case 'KL-Yersinia':
                return NRL_ID.KL_Yersinia;
            case 'Labor nicht erkannt':
            default:
                return NRL_ID.UNKNOWN;
        }
    }

    private nrlCache: NRL[] = [];
    constructor(
        @inject(APPLICATION_TYPES.ParseNRLRepository)
        private parseNrlRepository: ParseNRLRepository
    ) {
        this.parseNrlRepository
            .retrieve()
            .then(data => (this.nrlCache = data))
            .catch(error => {
                logger.error(`Service unable to load NRL data. error=${error}`);
                throw error;
            });
    }

    async retrieveNRLs(): Promise<NRL[]> {
        return this.parseNrlRepository.retrieve();
    }

    assignNRLsToSamples(samples: Sample[]): Sample[] {
        return samples.map(sample => {
            const newSample = sample.clone();
            const pathogen = newSample.getValueFor('pathogen_avv');
            const nrl = this.getNRLForPathogen(pathogen);
            newSample.setNRL(this, nrl);
            return newSample;
        });
    }

    getEmailForNRL(nrl: NRL_ID): string {
        const found = this.nrlCache.find(n => n.id === nrl);
        if (!found) {
            throw new ApplicationDomainError(
                `Unable to retrieve email for NRL. nrl=${nrl.toString()}`
            );
        }
        return found.email;
    }

    getNRLForPathogen(pathogen: string): NRL_ID {
        if (!pathogen) {
            return NRL_ID.UNKNOWN;
        }

        for (const nrlConfig of this.nrlCache) {
            for (const selector of nrlConfig.selectors) {
                const regexp = new RegExp(selector, 'i');
                if (regexp.test(pathogen)) {
                    return nrlConfig.id;
                }
            }
        }
        return NRL_ID.UNKNOWN;
    }

    getOptionalAnalysisFor(nrl: NRL_ID): Partial<Analysis> {
        const found = this.nrlCache.find(n => n.id === nrl);
        if (!found) {
            return {};
        }
        const analysis: Partial<Analysis> = {};

        found.optionalProcedures.reduce((acc, p) => {
            this.setValueForAnalysisKey(p.key, acc, false);
            return acc;
        }, analysis);

        return analysis;
    }

    getStandardAnalysisFor(nrl: NRL_ID): Partial<Analysis> {
        const found = this.nrlCache.find(n => n.id === nrl);
        if (!found) {
            return {};
        }
        const analysis: Partial<Analysis> = {};
        found.standardProcedures.reduce((acc, p) => {
            this.setValueForAnalysisKey(p.key, acc, true);
            return acc;
        }, analysis);

        return analysis;
    }

    private setValueForAnalysisKey(
        key: number,
        analysis: Partial<Analysis>,
        value: boolean
    ): void {
        switch (key) {
            case 0:
                analysis.species = value;
                break;
            case 1:
                analysis.serological = value;
                break;
            case 2:
                analysis.resistance = value;
                break;
            case 3:
                analysis.vaccination = value;
                break;
            case 4:
                analysis.molecularTyping = value;
                break;
            case 5:
                analysis.toxin = value;
                break;
            case 6:
                analysis.esblAmpCCarbapenemasen = value;
                break;
            case 7:
                analysis.sample = value;
                break;
        }
    }
}
