
import * as _ from 'lodash';
import { ICatalogPort, ISearchAlias } from './catalog.service';

export interface ISearchOptions extends Fuse.FuseOptions {
    useEnhanced: boolean;
    options: Fuse.FuseOptions;
}

export interface ICatalogSearchPort {
    searchCatalog(catalogName: string, searchTerm: string, searchOptions: Fuse.FuseOptions, useEnhanced: boolean): void;
}

export interface ICatalogSearchService extends ICatalogSearchPort {
}

class CatalogSearchService implements ICatalogSearchService {

    constructor(private catalogService: ICatalogPort) { }
    searchCatalog(catalogName: string, searchTerm: string, searchOptions: Fuse.FuseOptions, useEnhanced: boolean) {

        // tslint:disable-next-line:no-any
        let enhancements: any[] = [];
        if (useEnhanced) {
            // FIXME: Map callback is hard coded & dependent on catalog: Need to refactor Catalog data structure: generalize fields
            if (catalogName !== 'adv16') {
                throw new Error(`Enhancements for Catalog ${catalogName} not supported`);
            }
            enhancements = _(this.catalogService.getCatalogSearchAliases(catalogName))
                .map((e: ISearchAlias) => {
                    return e.alias.map(alias => ({
                        Text1: e.token,
                        'P-Code3': alias
                    }));
                })
                .flattenDeep()
                .value();
        }
        const fuse = this.catalogService.getCatalog(catalogName).getFuzzyIndex(searchOptions, enhancements);
        return fuse.search(searchTerm);
    }

}

export function createService(service: ICatalogPort): ICatalogSearchService {
    return new CatalogSearchService(service);
}
