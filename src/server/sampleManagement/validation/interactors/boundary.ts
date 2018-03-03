import { ICatalog } from './../entities';
export interface ICatalogRepository {
    getCatalog(catalogName: string): ICatalog<any>
}
