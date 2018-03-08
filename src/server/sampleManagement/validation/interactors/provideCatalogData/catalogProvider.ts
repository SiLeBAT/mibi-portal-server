
import { ICatalog } from './../../entities';
import { ServerError } from '../../../../../aspects';
// FIXME: Catalog data should be in db
import { createCatalogRepository } from './../../persistence';
import { ICatalogRepository } from './../../gateways';

let catalogRepository: ICatalogRepository;

createCatalogRepository().then(
    (repo: ICatalogRepository) => catalogRepository = repo
). catch(
    (err: Error) => {
        throw new ServerError('Unable to retrieve Catalog Repository', err);
    }
);

// tslint:disable-next-line
function getCatalog(catalogName: string): ICatalog<any> {
    return catalogRepository.getCatalog(catalogName);
}

export {
    getCatalog
};
