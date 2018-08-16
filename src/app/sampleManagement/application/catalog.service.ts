
import { ICatalog } from './../domain';
import { ICatalogRepository } from '../../ports';

export interface ICatalogPort {
    // tslint:disable-next-line
    getCatalog(catalogName: string): ICatalog<any>;
}

export interface ICatalogService extends ICatalogPort {
}

class CatalogService implements ICatalogService {

    constructor(private catalogRepository: ICatalogRepository) { }

    getCatalog(catalogName: string) {
        return this.catalogRepository.getCatalog(catalogName);
    }

}

export function createService(repository: ICatalogRepository): ICatalogService {
    return new CatalogService(repository);
}
