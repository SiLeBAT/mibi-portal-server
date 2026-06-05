import { logger } from './aspects';
import { configurationService } from './configuratioin.service';
import { startParseServer } from './infrastructure/parse';
import { initialiseServices } from './ui/server/composition-root';
import { initialiseExpress } from './ui/server/express.setup';
async function init() {
    await startParseServer();

    const appConfiguration = configurationService.getApplicationConfiguration();

    logger.info(`Starting MiBi-Portal. appName=${appConfiguration.appName}`);

    const composition = await initialiseServices();
    initialiseExpress(composition);
}

init().catch(error => {
    logger.error(`Unable to initialise application. error=${error}`);
    throw error;
});
