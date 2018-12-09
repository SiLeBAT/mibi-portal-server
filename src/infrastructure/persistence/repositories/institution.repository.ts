import { createRepository, InstitutionSchema, IInstitutionModel } from '../data-store';
import { IRepositoryBase, IInstitutionRepository, Institution, createInstitution } from '../../../app/ports';
import { mapModelToInstitution } from './data-mappers';

class InstitutionRepository implements IInstitutionRepository {

    constructor(private baseRepo: IRepositoryBase<IInstitutionModel>) {
    }

    findById(id: string): Promise<Institution | null> {
        return this.baseRepo.findById(id).then(
            m => {
                if (!m) return null;
                return mapModelToInstitution(m);
            }
        );
    }

    retrieve(): Promise<Institution[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToInstitution(m));
            }
        );
    }

    createInstitution(institution: Institution): Promise<Institution> {
        const newInstitution = new InstitutionSchema({
            state_short: institution.stateShort,
            name1: institution.name1,
            location: institution.location,
            phone: institution.phone,
            fax: institution.fax
        });
        return this.baseRepo.create(newInstitution).then(
			model => createInstitution(model._id.toHexString())
        );
    }

    findByInstitutionName(name: string): Promise<Institution | null> {
        return this.baseRepo.findOne({ name1: name }).then(
            (model: IInstitutionModel | null) => {
                if (!model) return null;
                return createInstitution(model._id.toHexString());
            }
        );
    }

}

export const repository: IInstitutionRepository = new InstitutionRepository(createRepository(InstitutionSchema));
