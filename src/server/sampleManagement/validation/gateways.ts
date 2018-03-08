import { ICatalog } from './entities';
export interface ICatalogRepository {
    // tslint:disable-next-line
    getCatalog(catalogName: string): ICatalog<any>;
}
