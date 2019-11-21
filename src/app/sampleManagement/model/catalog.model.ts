import { SearchAlias } from './validation.model';

export type CatalogData =
    | Record<string, string>
    | ADVCatalogEntry
    | ZSPCatalogEntry;

export interface ADVCatalogEntry {
    Kode: string;
    Text: string;
    Kodiersystem: string;
}

export interface ZSPCatalogEntry {
    'ADV8-Kode': string;
    Kodiersystem: string;
    'ADV3-Kode': string;
    'ADV3-Text1': string;
}
export interface ADV9CatalogEntry extends ADVCatalogEntry {
    PLZ: string;
}
export interface CatalogConfig {
    filename: string;
    id: string;
    uId?: string;
    filterFunction?: Function;
    mappingFunction?: Function;
    delimiter?: string;
    headers: boolean;
}

export interface Catalog<T extends CatalogData> {
    getEntriesWithKeyValue(key: string, value: string): T[];
    getUniqueEntryWithId(id: string): T;
    containsUniqueEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.FuseOptions, enhancements?: any[]): Fuse;
    dump(): T[];
}

export interface CatalogPort {
    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T>;
    getCatalogSearchAliases(catalogName: string): SearchAlias[];
}

export interface CatalogService extends CatalogPort {}
