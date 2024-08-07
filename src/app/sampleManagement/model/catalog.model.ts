import { SearchAlias } from './validation.model';
import Fuse from 'fuse.js';

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
    'ADV8-Kode': string[];
    Kodiersystem: string[];
    'ADV3-Kode': string[];
    'ADV16-Kode': string[];
}

export interface AVV313CatalogEntry extends ADVCatalogEntry {
    PLZ: string;
}

export interface Catalog<T extends CatalogData> {
    getEntriesWithKeyValue(key: string, value: string): T[];
    getUniqueEntryWithId(id: string): T;
    containsUniqueEntryWithId(id: string): boolean;
    containsEntryWithKeyValue(key: string, value: string): boolean;
    hasUniqueId(): boolean;
    getUniqueId(): string;
    // tslint:disable-next-line
    getFuzzyIndex(options: Fuse.IFuseOptions<T>, enhancements?: T[]): Fuse<T>;
    dump(): T[] | T;
}

export interface CatalogPort {
    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T>;
    getCatalogSearchAliases(catalogName: string): SearchAlias[];
    getAVVCatalog<T extends AVVCatalogData>(catalogName: string): AVVCatalog<T>;
}

export interface CatalogService extends CatalogPort {}

export interface AVVCatalog<T extends AVVCatalogData> {
    containsEintragWithAVVKode(kode: string): boolean;
    containsTextEintrag(value: string): boolean;
    getEintragWithAVVKode(
        kode: string
    ): MibiEintrag | MibiFacettenEintrag | undefined;
    getAVV313EintragWithAVVKode(kode: string): AVV313Eintrag | undefined;
    getAttributeWithAVVKode(kode: string): string[] | undefined;
    containsFacetteWithBegriffsId(begriffsId: string): boolean;
    getFacettenIdsWithKode(kode: string): number[] | undefined;
    getFacetteWithBegriffsId(begriffsId: string): MibiFacette | undefined;
    getFacettenWertWithBegriffsId(
        facettenWertId: string,
        facettenBegriffsId: string
    ): MibiFacettenWert | undefined;
    assembleAVVKode(begriffsIdEintrag: string, id: string): string;
    getTextWithAVVKode(kode: string, includingFacettenName?: boolean): string;
    hasFacettenInfo(kode: string): boolean;
    isBasicCode(kode: string): boolean;
    getTextWithFacettenCode(kode: string): string;
    getObligatoryFacettenzuordnungen(kode: string): MibiFacettenzuordnung[];
    getFuzzyIndex(
        options: Fuse.IFuseOptions<FuzzyEintrag>,
        enhancements?: FuzzyEintrag[]
    ): Fuse<FuzzyEintrag>;
    getUniqueId(): string;
    dump(): T;
}

export type AVVCatalogData =
    | MibiCatalogData
    | MibiCatalogFacettenData
    | AVV324Data;
export interface MibiCatalog {
    data: AVVCatalogData;
    uId: string;
}

export interface MibiCatalogData {
    version: string;
    gueltigAb: string;
    katalogNummer: string;
    katalogName: string;
    facettenErlaubt: boolean;
    eintraege: MibiEintraege;
}

export interface AVV324Data extends MibiCatalogData {
    textEintraege: AVV324Eintraege;
    fuzzyEintraege: FuzzyEintrag[];
}

export interface MibiCatalogFacettenData extends MibiCatalogData {
    facetten: MibiFacetten;
    facettenIds?: MibiFacettenIds;
}

export interface MibiFacettenIds {
    [key: string]: MibiFacettenId;
}

export interface MibiFacettenId {
    [key: string]: MibiFacettenWertId;
}

export interface MibiFacettenWertId {
    FacettenNameBegriffsId: number;
    WertNameBegriffsId: number;
}

export interface MibiEintraege {
    [key: string]: MibiEintrag | AVV313Eintrag | MibiFacettenEintrag;
}

export interface AVV324Eintraege {
    [key: string]: string;
}

export interface MibiEintrag {
    Text: string;
    Basiseintrag: boolean;
}

export interface AVV313Eintrag extends MibiEintrag {
    PLZ: string;
    Name: string;
}

export interface FuzzyEintrag extends MibiEintrag {
    Kode: string;
}

export interface MibiFacettenEintrag extends MibiEintrag {
    FacettenIds: number[];
    Facettenzuordnungen?: MibiFacettenzuordnung[];
    Attribute?: string;
}

export interface MibiFacettenzuordnung {
    FacettenId: number;
    FacettenwertId: number;
    Festgelegt: boolean;
}

export interface MibiFacetten {
    [key: string]: MibiFacette;
}

export interface MibiFacette {
    FacettenId: number;
    MehrfachAuswahl: boolean;
    Text: string;
    FacettenWerte: MibiFacettenWerte;
}

export interface MibiFacettenWerte {
    [key: string]: MibiFacettenWert;
}

export interface MibiFacettenWert {
    Text: string;
}
