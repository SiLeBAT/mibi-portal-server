import { userRepository, tokenRepository, institutionRepository, catalogRepository, stateRepository } from './../../../infrastructure/persistence/repositories';
import { ApplicationSystemError } from '../errors';

export enum RepositoryType {
    USER, TOKEN, INSTITUTION, CATALOG, STATE
}
export interface IRepositoryFactory {
    // tslint:disable-next-line
    getRepository(repositoryName: RepositoryType): any;
}

export class RepositoryFactory implements IRepositoryFactory {
    getRepository(repositoryName: RepositoryType) {
        switch (repositoryName) {
            case RepositoryType.USER:
                return userRepository;
            case RepositoryType.TOKEN:
                return tokenRepository;
            case RepositoryType.INSTITUTION:
                return institutionRepository;
            case RepositoryType.STATE:
                return stateRepository;
            case RepositoryType.CATALOG:
                return catalogRepository;
            default:
                throw new ApplicationSystemError(`Unknown repositoryName, repositoryName=${repositoryName}`);
        }
    }
}
