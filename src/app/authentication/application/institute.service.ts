import { InstituteRepository } from '../../ports';
import { InstituteService, Institute } from '../model/institute.model';

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
