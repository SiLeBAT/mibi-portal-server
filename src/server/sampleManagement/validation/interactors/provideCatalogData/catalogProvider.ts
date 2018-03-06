import * as path from 'path';

import { ICatalog } from "./../../entities";
import { logger } from './../../../../../aspects';
import { createRepository } from "./../../persistence";

let catalogRepository;

createRepository().then(
    (repo) => catalogRepository = repo
);

function getCatalog(catalogName: string): ICatalog<any> {
    return catalogRepository.getCatalog(catalogName);
}

export {
    getCatalog
}