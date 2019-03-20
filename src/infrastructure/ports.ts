export {
    createRepository
} from './persistence/data-store/mongoose/mongoose.repository';
export {
    mapCollectionToRepository
} from './persistence/data-store/mongoose/mongoose';
export {
    createDataStore,
    DataStoreType,
    IDataStore
} from './persistence/data-store/data-store.factory';

export {
    initialiseRepository as initialiseCatalogRepository
} from './persistence/repositories/catalog.repository';
export {
    initialiseRepository as initialiseSearchAliasRepository
} from './persistence/repositories/search-alias.repository';
export {
    repository as institutionRepository
} from './persistence/repositories/institute.repository';
export {
    repository as nrlRepository
} from './persistence/repositories/nrl.repository';
export {
    repository as stateRepository
} from './persistence/repositories/state.repository';
export {
    repository as userRepository
} from './persistence/repositories/user.repository';
export {
    repository as tokenRepository
} from './persistence/repositories/token.repository';
export {
    repository as validationErrorRepository
} from './persistence/repositories/validation-error.repository';
export { registerListeners } from './mail/mail';
