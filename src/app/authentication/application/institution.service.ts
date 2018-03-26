import { IInstitution } from './../domain';
import { IInstitutionRepository } from '../../ports';

export interface IInstitutionPort {
    retrieveInstitutions(): Promise<IInstitution[]>;
}

export interface IInstitutionService extends IInstitutionPort {
}

class InstitutionService implements IInstitutionService {

    constructor(
        private institutionRepository: IInstitutionRepository) { }

    async retrieveInstitutions(): Promise<IInstitution[]> {
        return this.institutionRepository.retrieve();
    }
}

export function createService(institutionRepository: IInstitutionRepository): IInstitutionService {
    return new InstitutionService(institutionRepository);
}
