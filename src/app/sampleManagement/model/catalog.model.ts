import { SearchAlias } from './validation.model';

export interface Catalog<T> {
    getEntriesWithKeyValue(key: string, value: string): T[];
    getUniqueEntryWithId(id: string): T;
    containsUniqueEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.FuseOptions, enhamcements?: any[]): Fuse;
    dump(): T[];
}

export interface CatalogPort {
    getCatalog(catalogName: string): Catalog<Record<string, string>>;
    getCatalogSearchAliases(catalogName: string): SearchAlias[];
}

export interface CatalogService extends CatalogPort {}
