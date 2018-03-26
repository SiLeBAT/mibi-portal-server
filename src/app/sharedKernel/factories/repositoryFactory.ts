import { userRepository, tokenRepository, institutionRepository, catalogRepository } from './../../../infrastructure/persistence/repositories';

export enum RepositoryType {
    USER, TOKEN, INSTITUTION, CATALOG
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
            case RepositoryType.CATALOG:
                return catalogRepository;
            default:
                throw new Error(`Unknown repositoryName, repositoryName=${repositoryName}`);
        }
    }
}
