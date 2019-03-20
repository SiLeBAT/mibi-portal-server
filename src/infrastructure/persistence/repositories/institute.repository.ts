import {
    RepositoryBase,
    InstituteRepository,
    Institute,
    createInstitution,
    ApplicationDomainError
} from '../../../app/ports';
import { mapModelToInstitution } from './data-mappers';
import { InstitutionModel } from '../data-store/mongoose/schemas/institution.schema';
import { InstitutionSchema } from '../data-store/mongoose/mongoose';
import { createRepository } from '../data-store/mongoose/mongoose.repository';

class DefaultInstituteRepository implements InstituteRepository {
    constructor(private baseRepo: RepositoryBase<InstitutionModel>) {}

    findById(id: string): Promise<Institute> {
        return this.baseRepo.findById(id).then(m => {
            if (!m) {
                throw new ApplicationDomainError(
                    `Institute not found. id=${id}`
                );
            }
            return mapModelToInstitution(m);
        });
    }

    retrieve(): Promise<Institute[]> {
        return this.baseRepo.retrieve().then(modelArray => {
            return modelArray.map(m => mapModelToInstitution(m));
        });
    }

    createInstitution(institution: Institute): Promise<Institute> {
        const newInstitution = new InstitutionSchema({
            state_short: institution.stateShort,
            name1: institution.name,
            city: institution.city,
            zip: institution.zip,
            phone: institution.phone,
            fax: institution.fax
        });
        return this.baseRepo
            .create(newInstitution)
            .then(model => createInstitution(model._id.toHexString()));
    }

    findByInstitutionName(name: string): Promise<Institute> {
        return this.baseRepo
            .findOne({ name1: name })
            .then((model: InstitutionModel) => {
                if (!model) {
                    throw new ApplicationDomainError(
                        `Institute not found. name=${name}`
                    );
                }
                return createInstitution(model._id.toHexString());
            });
    }
}

export const repository: InstituteRepository = new DefaultInstituteRepository(
    createRepository(InstitutionSchema)
);
