import * as _ from 'lodash';
import * as moment from 'moment';
import { NRLRepository } from '../../ports';

moment.locale('de');

export interface INRL {
	selectors: string[];
	name: string;
}
export interface INRLSelectorProviderPort {}

export interface INRLSelectorProvider extends INRLSelectorProviderPort {
	getSelectors(nrl?: string): RegExp[];
}

class NRLSelectorProvider implements INRLSelectorProvider {
	private nrls: INRL[] = [];
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
export function createService(repository: NRLRepository): INRLSelectorProvider {
	return new NRLSelectorProvider(repository);
}
