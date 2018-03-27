import { createRepository, InstitutionSchema, IInstitutionModel } from './../dataStore';
import { IRepositoryBase, IInstitutionRepository, IInstitution } from './../../../app/ports';
import { mapModelToInstitution } from './dataMappers';

class InstitutionRepository implements IInstitutionRepository {

    constructor(private baseRepo: IRepositoryBase<IInstitutionModel>) {
    }

    findById(id: string): Promise<IInstitution | null> {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) return null;
                return mapModelToInstitution(m);
            }
        );
    }

    retrieve(): Promise<IInstitution[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToInstitution(m));
            }
        );
    }
}

export const repository: IInstitutionRepository = new InstitutionRepository(createRepository(InstitutionSchema));
