import * as _ from 'lodash';
import * as moment from 'moment';
import { NRLRepository } from '../../ports';
import { NRLConfig, NRLSelectorProvider } from '../model/validation.model';

moment.locale('de');

class DefaultNRLSelectorProvider implements NRLSelectorProvider {
    private nrls: NRLConfig[] = [];
    constructor(private nrlRepository: NRLRepository) {
        this.nrlRepository
            .getAllNRLs()
            .then(data => (this.nrls = data))
            .catch(error => {
                throw error;
            });
    }
    getSelectors(nrl?: string): RegExp[] {
        let result: RegExp[] = [];
        if (!nrl) {
            return result;
        }
        const found = this.nrls.find(n => n.name === nrl);
        if (found) {
            result = found.selectors.map(s => new RegExp(s));
        }
        return result;
    }
}
export function createService(repository: NRLRepository): NRLSelectorProvider {
    return new DefaultNRLSelectorProvider(repository);
}
