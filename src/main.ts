import { configurationService } from './ConfigurationService';
import { logger } from './aspects';
import { initialiseRepositories } from './repositorySetup';
import { initialiseContainer } from './ui/server/containerSetup';
import { initialiseExpress } from './ui/server/expressSetup';


async function init() {
    const appConfiguration =
        configurationService.getApplicationConfiguration();

    logger.info(`Starting MiBi-Portal. appName=${appConfiguration.appName}`);
    const repositories = await initialiseRepositories();
    const container = await initialiseContainer(repositories.searchAliasRepository, repositories.catalogRepository);
    initialiseExpress(container);
}

init().catch(error => {
    logger.error(`Unable to initialise application. error=${error}`);
    throw error;
});
