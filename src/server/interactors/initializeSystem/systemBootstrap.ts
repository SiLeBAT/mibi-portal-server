import * as processenv from 'processenv';

import { logger } from './../../aspects/logging';
import { configInit } from './config';
import { initialize as initializeCatalog } from './../provideCatalogData'
import { IDataStore } from '..';


function initializeSystem() {
    configInit();
    initializeCatalog();

}

export {
    initializeSystem
}