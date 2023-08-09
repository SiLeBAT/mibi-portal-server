import _ from 'lodash';
import { AVVCatalogRepository, CatalogRepository, SearchAliasRepository } from '../../ports';
import { logger } from '../../../aspects';
import { CatalogService, Catalog, CatalogData, AVVCatalog, AVVCatalogData } from '../model/catalog.model';
import { SearchAlias } from '../model/validation.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultCatalogService implements CatalogService {
    constructor(
        @inject(APPLICATION_TYPES.CatalogRepository)
        private catalogRepository: CatalogRepository,
        @inject(APPLICATION_TYPES.SearchAliasRepository)
        private searchAliasRepository: SearchAliasRepository,
        @inject(APPLICATION_TYPES.AVVCatalogRepository)
        private avvCatalogRepository: AVVCatalogRepository,
    ) {}

    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T> {
        return this.catalogRepository.getCatalog<T>(catalogName);
    }

    getAVVCatalog<T extends AVVCatalogData>(catalogName: string): AVVCatalog<T> {
        return this.avvCatalogRepository.getAVVCatalog<T>(catalogName);
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
        } catch (error) {
            logger.warn(
                `${this.constructor.name}.${this.getCatalogSearchAliases.name}, no SearchAlias configuration found in configuration, error=${error}`
            );
        }
        return searchAlias;
    }
}
