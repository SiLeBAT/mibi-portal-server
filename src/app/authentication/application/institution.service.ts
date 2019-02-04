import { Institution } from './../domain';
import { InstitutionRepository } from '../../ports';

export interface InstitutionPort {
	retrieveInstitutions(): Promise<Institution[]>;
}

export interface InstitutionService extends InstitutionPort {}

class DefaultInstitutionService implements InstitutionService {
	constructor(private institutionRepository: InstitutionRepository) {}

	async retrieveInstitutions(): Promise<Institution[]> {
		let institutions = await this.institutionRepository.retrieve();

		return institutions.filter(
			(institution: Institution) => institution.name1 !== 'dummy'
		);
	}
}

export function createService(
	institutionRepository: InstitutionRepository
): InstitutionService {
	return new DefaultInstitutionService(institutionRepository);
}
