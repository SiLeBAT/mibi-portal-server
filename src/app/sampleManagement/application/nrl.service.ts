import { Analysis } from './../model/sample.model';
import { NRL_ID } from './../domain/enums';
import { ApplicationDomainError } from './../../core/domain/domain.error';
import { Sample } from '../model/sample.model';
import { NRLService, NRL } from '../model/nrl.model';
import _ from 'lodash';
import { logger } from '../../../aspects';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from '../../application.types';
import { NRLRepository } from '../model/repository.model';

@injectable()
export class DefaultNRLService implements NRLService {
    static mapNRLStringToEnum(nrlString: string): NRL_ID {
        switch (nrlString.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
            case 'NRL-Vibrio':
                return NRL_ID.NRL_Vibrio;
            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
            case 'NRL-VTEC':
                return NRL_ID.NRL_VTEC;
            case 'Bacillus spp.':
            case 'L-Bacillus':
                return NRL_ID.L_Bacillus;
            case 'Clostridium spp. (C. difficile)':
            case 'L-Clostridium':
                return NRL_ID.L_Clostridium;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
            case 'NRL-Staph':
                return NRL_ID.NRL_Staph;
            case 'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)':
            case 'NRL-Salm':
                return NRL_ID.NRL_Salm;
            case 'NRL Listeria monocytogenes':
            case 'NRL-Listeria':
                return NRL_ID.NRL_Listeria;
            case 'NRL Campylobacter':
            case 'NRL-Campy':
                return NRL_ID.NRL_Campy;
            case 'NRL Antibiotikaresistenz':
            case 'NRL-AR':
                return NRL_ID.NRL_AR;
            case 'Yersinia':
            case 'KL-Yersinia':
                return NRL_ID.KL_Yersinia;
            case 'NRL-Trichinella':
            case 'NRL Trichinella':
                return NRL_ID.NRL_Trichinella;
            case 'NRL Überwachung von Viren in zweischaligen Weichtieren':
            case 'NRL-Virus':
                return NRL_ID.NRL_Virus;
            case 'Leptospira':
            case 'KL-Leptospira':
                return NRL_ID.KL_Leptospira;
            case 'Labor nicht erkannt':
            default:
                return NRL_ID.UNKNOWN;
        }
    }

    private nrlCache: NRL[] = [];
    constructor(
        @inject(APPLICATION_TYPES.NRLRepository)
        private nrlRepository: NRLRepository
    ) {
        this.nrlRepository
            .retrieve()
            .then(data => (this.nrlCache = data))
            .catch(error => {
                logger.error(`Service unable to load NRL data. error=${error}`);
                throw error;
            });
    }

    async retrieveNRLs(): Promise<NRL[]> {
        return this.nrlRepository.retrieve();
    }

    assignNRLsToSamples(samples: Sample[]): Sample[] {
        return samples.map(sample => {
            const newSample = sample.clone();
            const pathogen = newSample.getValueFor('pathogen_adv');
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
            this.setValueForAnalysisKey('' + p.key, acc, false);
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
            this.setValueForAnalysisKey('' + p.key, acc, true);
            return acc;
        }, analysis);

        return analysis;
    }

    private setValueForAnalysisKey(
        key: string,
        analysis: Partial<Analysis>,
        value: boolean
    ): void {
        switch (key) {
            case '0':
                analysis.species = value;
                break;
            case '1':
                analysis.serological = value;
                break;
            case '2':
                analysis.resistance = value;
                break;
            case '3':
                analysis.vaccination = value;
                break;
            case '4':
                analysis.molecularTyping = value;
                break;
            case '5':
                analysis.toxin = value;
                break;
            case '6':
                analysis.esblAmpCCarbapenemasen = value;
                break;
            case '7':
                analysis.sample = value;
                break;
        }
    }
}
