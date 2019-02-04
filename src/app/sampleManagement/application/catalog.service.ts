import * as config from 'config';
import * as _ from 'lodash';
import { ICatalog } from './../domain';
import { CatalogRepository } from '../../ports';
import { logger } from '../../../aspects';

export interface ICatalogPort {
	getCatalog(catalogName: string): ICatalog<Record<string, string>>;
	getCatalogSearchAliases(catalogName: string): ISearchAlias[];
}

export interface ISearchAlias {
	catalog: string;
	token: string;
	alias: string[];
}

export interface ICatalogService extends ICatalogPort {}

class CatalogService implements ICatalogService {
	constructor(private catalogRepository: CatalogRepository) {}

	getCatalog(catalogName: string) {
		return this.catalogRepository.getCatalog(catalogName);
	}

	getCatalogSearchAliases(catalogName: string) {
		let searchAlias: ISearchAlias[] = [];

		try {
			searchAlias = _(config.get('searchAlias'))
				.filter(
					(e: ISearchAlias) =>
						e.catalog.toLowerCase().localeCompare(catalogName) === 0
				)
				.value();
		} catch (err) {
			logger.warn('No SearchAlias configuration found in configuration.');
		}
		return searchAlias;
	}
}

export function createService(repository: CatalogRepository): ICatalogService {
	return new CatalogService(repository);
}
