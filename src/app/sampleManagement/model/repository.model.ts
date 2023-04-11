import {
    AVVFormatCollection,
    ValidationError,
    SearchAlias
} from './validation.model';
import { Catalog, CatalogData } from './catalog.model';
import { NRL } from './nrl.model';

export interface ParseValidationErrorRepository {
    getAllErrors(): Promise<ValidationError[]>;
}

export interface ParseStateRepository {
    getAllFormats(): Promise<AVVFormatCollection>;
}

export interface ParseNRLRepository {
    retrieve(): Promise<NRL[]>;
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
