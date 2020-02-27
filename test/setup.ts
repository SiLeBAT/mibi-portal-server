import * as config from 'config';
import { logger } from '../src/aspects';

logger.info(`Integration test will be run against: ${config.get('apiUrl')}`);
