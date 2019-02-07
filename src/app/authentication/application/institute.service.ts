import { Institute } from '../domain';
import { InstituteRepository } from '../../ports';

export interface InstitutePort {
    retrieveInstitutes(): Promise<Institute[]>;
}

export interface InstituteService extends InstitutePort {}

class DefaultInstituteService implements InstituteService {
    constructor(private institutionRepository: InstituteRepository) {}

    async retrieveInstitutes(): Promise<Institute[]> {
        let institutions = await this.institutionRepository.retrieve();

        return institutions.filter(
            (institution: Institute) => institution.name !== 'dummy'
        );
    }
}

export function createService(
    institutionRepository: InstituteRepository
): InstituteService {
    return new DefaultInstituteService(institutionRepository);
}
