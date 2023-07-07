import { configurationService } from './configuratioin.service';
import { logger } from './aspects';
import { initialiseRepositories } from './repository.setup';
import { initialiseContainer } from './ui/server/container.setup';
import { initialiseExpress } from './ui/server/express.setup';


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
