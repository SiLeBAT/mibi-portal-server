import {
    AVVFormatCollection,
    ValidationError,
    NRLConfig,
    SearchAlias
} from './validation.model';
import { Catalog, CatalogData } from './catalog.model';

export interface ValidationErrorRepository {
    getAllErrors(): Promise<ValidationError[]>;
}
export interface StateRepository {
    getAllFormats(): Promise<AVVFormatCollection>;
}

export interface NRLRepository {
    getAllNRLs(): Promise<NRLConfig[]>;
}

export interface CatalogRepository {
    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T>;
}

export interface SearchAliasRepository {
    getAliases(): SearchAlias[];
}

export interface FileRepository {
    getFileBuffer(fileName: string): Promise<Buffer>;
}
