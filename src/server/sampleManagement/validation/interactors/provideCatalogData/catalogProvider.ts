import * as path from 'path';

import { ICatalog } from "./../../entities";
import { logger } from './../../../../../aspects';
import { repository as catalogRepository } from "./../../persistence";

function getCatalog(catalogName: string): ICatalog<any> {
    return catalogRepository.getCatalog(catalogName);
}

export {
    getCatalog
}