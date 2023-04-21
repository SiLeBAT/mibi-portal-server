import {
    InstituteService,
    Institute,
    ParseInstituteRepository
} from '../model/institute.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

@injectable()
export class DefaultInstituteService implements InstituteService {
    constructor(
        @inject(APPLICATION_TYPES.ParseInstituteRepository)
        private parseInstituteRepository: ParseInstituteRepository
    ) {}

    async retrieveInstitutes(): Promise<Institute[]> {
        return this.parseInstituteRepository.retrieve();
    }

    async getInstituteById(instituteId: string): Promise<Institute> {
        return this.parseInstituteRepository.findByInstituteId(instituteId);
    }

    async getInstituteByName(name: string): Promise<Institute> {
        return this.parseInstituteRepository.findByInstituteName(name);
    }

    async createInstitute(institute: Institute): Promise<Institute> {
        return this.parseInstituteRepository.createInstitute(institute);
    }
}
