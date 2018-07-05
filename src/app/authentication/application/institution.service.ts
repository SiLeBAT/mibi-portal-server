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
        let institutions = await this.institutionRepository.retrieve();

        return institutions.filter((institution: IInstitution) => institution.name1 !== 'dummy');
    }
}

export function createService(institutionRepository: IInstitutionRepository): IInstitutionService {
    return new InstitutionService(institutionRepository);
}
