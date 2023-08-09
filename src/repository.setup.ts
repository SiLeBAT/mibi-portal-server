import { configurationService } from './configuratioin.service';
import { logger } from './aspects';
import {
    initialiseCatalogRepository,
    initialiseSearchAliasRepository,
    initialiseAVVCatalogRepository
} from './infrastructure/ports';
import {
    DataStoreConfiguration
} from './main.model';


export async function initialiseRepositories() {

    const dataStoreConfig: DataStoreConfiguration =
        configurationService.getDataStoreConfiguration();



    const catalogRepository = await initialiseCatalogRepository(
        dataStoreConfig.dataDir
    ).catch((error: Error) => {
        logger.error(
            `Failed to initialize Catalog Repository. error=${String(error)}`
        );
        throw error;
    });

    const avvCatalogRepository = await initialiseAVVCatalogRepository(
        dataStoreConfig.dataDir
    ).catch((error: Error) => {
        logger.error(
            `Failed to initialize AVVCatalog Repository. error=${String(error)}`
        );
        throw error;
    });

    const searchAliasRepository = await initialiseSearchAliasRepository(
        dataStoreConfig.dataDir
    ).catch((error: Error) => {
        logger.error(
            `Failed to initialize Search Alias Repository. error=${String(
                error
            )}`
        );
        throw error;
    });

    return {
        searchAliasRepository, catalogRepository, avvCatalogRepository
    };

}

