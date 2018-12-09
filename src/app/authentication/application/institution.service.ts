import { Institution } from './../domain';
import { IInstitutionRepository } from '../../ports';

export interface IInstitutionPort {
    retrieveInstitutions(): Promise<Institution[]>;
}

export interface IInstitutionService extends IInstitutionPort {
}

class InstitutionService implements IInstitutionService {

    constructor(
        private institutionRepository: IInstitutionRepository) { }

    async retrieveInstitutions(): Promise<Institution[]> {
        let institutions = await this.institutionRepository.retrieve();

        return institutions.filter((institution: Institution) => institution.name1 !== 'dummy');
    }
}

export function createService(institutionRepository: IInstitutionRepository): IInstitutionService {
    return new InstitutionService(institutionRepository);
}
