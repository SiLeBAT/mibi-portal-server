import { IRead, IRepositoryBase } from './../../../server/core';
import { IInstitutionEntity, createInstitution } from './../../../server/userManagement/shared/entities';
import { InvalidOperationError, logger, ServerError } from './../../../aspects';
import { createRepository, InstitutionSchema, IInstitutionModel } from './../dataStore';
import { IInstitutionRepository } from './../../../server/userManagement/shared/interactors';
import { mapModelToInstitution } from './dataMappers';

class InstitutionRepository implements IInstitutionRepository {

    constructor(private baseRepo: IRepositoryBase<IInstitutionModel>) {
    }

    findById(id: string): Promise<IInstitutionEntity | null> {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) {
                    logger.error('Institution not found');
                    throw new ServerError('Institution not found');
                }
                return mapModelToInstitution(m);
            }
        );
    }

    retrieve(): Promise<IInstitutionEntity[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToInstitution(m));
            }
        );
    }
}

export const repository: IInstitutionRepository = new InstitutionRepository(createRepository(InstitutionSchema));
