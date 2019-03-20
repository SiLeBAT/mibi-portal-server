import * as _ from 'lodash';
import { CatalogRepository, SearchAliasRepository } from '../../ports';
import { logger } from '../../../aspects';
import { CatalogService } from '../model/catalog.model';
import { SearchAlias } from '../model/validation.model';

class DefaultCatalogService implements CatalogService {
    constructor(
        private catalogRepository: CatalogRepository,
        private searchAliasRepository: SearchAliasRepository
    ) {}

    getCatalog(catalogName: string) {
        return this.catalogRepository.getCatalog(catalogName);
    }

    getCatalogSearchAliases(catalogName: string) {
        let searchAlias: SearchAlias[] = [];

        try {
            searchAlias = _(this.searchAliasRepository.getAliases())
                .filter(
                    (e: SearchAlias) =>
                        e.catalog.toLowerCase().localeCompare(catalogName) === 0
                )
                .value();
        } catch (err) {
            logger.warn('No SearchAlias configuration found in configuration.');
        }
        return searchAlias;
    }
}

export function createService(
    catalogRepository: CatalogRepository,
    searchAliasRepository: SearchAliasRepository
): CatalogService {
    return new DefaultCatalogService(catalogRepository, searchAliasRepository);
}
