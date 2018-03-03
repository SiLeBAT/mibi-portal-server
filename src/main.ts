// npm
import * as config from 'config';

// local
import { createServer } from './server';
import { DataStoreType, createDataStore } from './peripherals';

const primaryDataStore = createDataStore(DataStoreType.MONGO);
primaryDataStore.initialize(config.get('dataStore.connectionString'));

const server = createServer(config.get('server'));
server.start();