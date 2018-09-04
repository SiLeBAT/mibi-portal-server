
import * as _ from 'lodash';
import * as Fuse from 'fuse.js';

interface ISearchResult {
    item: string;
    score: number;
}
export interface ICatalogSearchPort {
    // tslint:disable-next-line:no-any
    searchCatalog(catalog: any[], searchTerms: string[], searchOptions: Fuse.FuseOptions): void;
}

export interface ICatalogSearchService extends ICatalogSearchPort {
}

class CatalogSearchService implements ICatalogSearchService {

    // tslint:disable-next-line:no-any
    searchCatalog(catalog: any[], searchTerms: string[], searchOptions: Fuse.FuseOptions) {
        const fuse = new Fuse(catalog, searchOptions);
        const result = searchTerms.reduce((acc: Record<string, ISearchResult[]>, t) => {
            acc[t] = fuse.search(t);
            return acc;
        }, {});
        return result;
    }

}

export function createService(): ICatalogSearchService {
    return new CatalogSearchService();
}
