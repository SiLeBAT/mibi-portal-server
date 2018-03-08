import { IInstitutionEntity } from './../../../shared/entities';
import { getRepository, RepositoryType } from '../../../../core';
import { IInstitutionRepository } from '../../../shared/gateway';

function retrieveInstitutions(): Promise<IInstitutionEntity[]> {
    const institutionRepository: IInstitutionRepository = getRepository(RepositoryType.INSTITUTION);
    return institutionRepository.retrieve();
}

export {
    retrieveInstitutions
};
