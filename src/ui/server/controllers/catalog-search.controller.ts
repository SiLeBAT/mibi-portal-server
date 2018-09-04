
import { Request, Response } from 'express';
import { logger } from '../../../aspects';
import { IController, ICatalogSearchPort } from '../../../app/ports';

export interface ICatalogSearchController extends IController {
    searchCatalog(req: Request, res: Response): Promise<void>;
}

class CatalogSearchController implements ICatalogSearchController {

    constructor(private catalogSearchService: ICatalogSearchPort) {}

    async searchCatalog(req: Request, res: Response) {

        const body = req.body;
        logger.info('CatalogSearchController.searchCatalog, Request received');
        const searchTerm: string = body.searchTerm;
        const enhanced: boolean = body.enhanced;
        const catalog: string = body.catalog;
        const searchOptions = body.searchOptions;
        let dto;
        try {
            dto = this.catalogSearchService.searchCatalog(catalog, searchTerm, searchOptions, enhanced);
            res.status(200);
        } catch (err) {
            logger.error(`Unable to search catalog. error=${err}`);
            dto = {};
            res.status(500);
        }
        logger.info('CatalogSearchController.searchCatalog, Response sent');
        return res.json(dto).end();
    }
}

export function createController(service: ICatalogSearchPort) {
    return new CatalogSearchController(service);
}
