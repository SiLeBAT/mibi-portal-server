import { userRepository, userDataRepository, tokenRepository, institutionRepository } from './../../../peripherals/persistence/repositories';
import { logger, InvalidRepositoryError } from '../../../aspects';
import { IEntityRepository } from '../gateways';

export enum RepositoryType {
    USER, USERDATA, TOKEN, INSTITUTION
}

// TODO: Fix this any: Proper use of Generics?
// tslint:disable-next-line
function getRepository<T extends IEntityRepository>(type: RepositoryType): any {
    switch (type) {
        case RepositoryType.USER:
            return userRepository;
        case RepositoryType.USERDATA:
            return userDataRepository;
        case RepositoryType.TOKEN:
            return tokenRepository;
        case RepositoryType.INSTITUTION:
            return institutionRepository;
        default:
            logger.error(`Unable to provide repository. Repository of type ${type} does not exist.`);
            throw new InvalidRepositoryError(`Repository of type ${type} does not exist.`);
    }
}

export {
    getRepository
};
