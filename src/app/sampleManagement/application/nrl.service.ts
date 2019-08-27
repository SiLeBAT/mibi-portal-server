import { NRLConfig } from './../model/validation.model';
import { Sample } from '../model/sample.model';
import { NRLService } from '../model/nrl.model';
import * as _ from 'lodash';
import { logger } from '../../../aspects';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from '../../application.types';
import { NRLRepository } from '../model/repository.model';
import { NRL } from '../domain/enums';

@injectable()
export class DefaultNRLService implements NRLService {
    static mapNRLStringToEnum(nrlString: string): NRL {
        switch (nrlString.trim()) {
            case 'NRL Überwachung von Bakterien in zweischaligen Weichtieren':
            case 'NRL-Vibrio':
                return NRL.NRL_Vibrio;
            case 'NRL Escherichia coli einschließlich verotoxinbildende E. coli':
            case 'NRL Verotoxinbildende Escherichia coli':
            case 'NRL-VTEC':
                return NRL.NRL_VTEC;
            case 'Bacillus spp.':
            case 'L-Bacillus':
                return NRL.L_Bacillus;
            case 'Clostridium spp. (C. difficile)':
            case 'L-Clostridium':
                return NRL.L_Clostridium;
            case 'NRL koagulasepositive Staphylokokken einschließlich Staphylococcus aureus':
            case 'NRL-Staph':
                return NRL.NRL_Staph;
            case 'NRL Salmonellen (Durchführung von Analysen und Tests auf Zoonosen)':
            case 'NRL-Salm':
                return NRL.NRL_Salm;
            case 'NRL Listeria monocytogenes':
            case 'NRL-Listeria':
                return NRL.NRL_Listeria;
            case 'NRL Campylobacter':
            case 'NRL-Campy':
                return NRL.NRL_Campy;
            case 'NRL Antibiotikaresistenz':
            case 'NRL-AR':
                return NRL.NRL_AR;
            case 'Yersinia':
            case 'KL-Yersinia':
                return NRL.KL_Yersinia;
            case 'NRL-Trichinella':
            case 'NRL Trichinella':
                return NRL.NRL_Trichinella;
            case 'NRL Überwachung von Viren in zweischaligen Weichtieren':
            case 'NRL-Virus':
                return NRL.NRL_Virus;
            case 'Leptospira':
            case 'KL-Leptospira':
                return NRL.KL_Leptospira;
            case 'Labor nicht erkannt':
            default:
                return NRL.UNKNOWN;
        }
    }

    private nrlCache: NRLConfig[] = [];
    constructor(
        @inject(APPLICATION_TYPES.NRLRepository)
        private nrlRepository: NRLRepository
    ) {
        this.nrlRepository
            .getAllNRLs()
            .then(data => (this.nrlCache = data))
            .catch(error => {
                logger.error(`Service unable to load NRL data. error=${error}`);
                throw error;
            });
    }

    assignNRLsToSamples(samples: Sample[]): Sample[] {
        return samples.map(sample => {
            const newSample = sample.clone();
            const pathogen = newSample.getValueFor('pathogen_adv');
            const nrl = this.getNRLForPathogen(pathogen);
            newSample.nrl = nrl;
            return newSample;
        });
    }

    getEmailForNRL(nrl: NRL): string {
        let result: string = '';
        const found = this.nrlCache.find(n => n.name === nrl);
        if (found) {
            result = found.email;
        }
        return result;
    }

    private getNRLForPathogen(pathogen: string): NRL {
        if (!pathogen) {
            return NRL.UNKNOWN;
        }

        for (const nrlConfig of this.nrlCache) {
            for (const selector of nrlConfig.selectors) {
                const regexp = new RegExp(selector);
                if (regexp.test(pathogen)) {
                    return nrlConfig.name;
                }
            }
        }
        return NRL.UNKNOWN;
    }
}
