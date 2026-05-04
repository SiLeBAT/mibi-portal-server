import { logger } from './aspects';
import { configurationService } from './configuratioin.service';
import { startParseServer } from './infrastructure/parse';
import { initialiseContainer } from './ui/server/container.setup';
import { initialiseExpress } from './ui/server/express.setup';
async function init() {
    await startParseServer();

    const appConfiguration = configurationService.getApplicationConfiguration();

    logger.info(`Starting MiBi-Portal. appName=${appConfiguration.appName}`);

    const container = await initialiseContainer();
    initialiseExpress(container);
}

init().catch(error => {
    logger.error(`Unable to initialise application. error=${error}`);
    throw error;
});
