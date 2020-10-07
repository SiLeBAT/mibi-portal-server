import {
    InstituteService,
    Institute,
    InstituteRepository
} from '../model/institute.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultInstituteService implements InstituteService {
    constructor(
        @inject(APPLICATION_TYPES.InstituteRepository)
        private instituteRepository: InstituteRepository
    ) {}

    async retrieveInstitutes(): Promise<Institute[]> {
        return this.instituteRepository.retrieve();
    }

    async getInstituteById(instituteId: string): Promise<Institute> {
        return this.instituteRepository.findByInstituteId(instituteId);
    }

    async getInstituteByName(name: string): Promise<Institute> {
        return this.instituteRepository.findByInstituteName(name);
    }

    async createInstitute(institute: Institute): Promise<Institute> {
        return this.instituteRepository.createInstitute(institute);
    }
}
