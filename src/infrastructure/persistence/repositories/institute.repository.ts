import {
    InstituteRepository,
    Institute,
    createInstitution
} from '../../../app/ports';
import { mapModelToInstitution } from './data-mappers';
import { InstitutionDocument } from '../data-store/mongoose/schemas/institution.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { InstituteNotFoundError } from '../model/domain.error';

@injectable()
export class MongooseInstituteRepository
    extends MongooseRepositoryBase<InstitutionDocument>
    implements InstituteRepository
{
    constructor(
        @inject(PERSISTENCE_TYPES.InstitutionModel)
        private model: Model<InstitutionDocument>
    ) {
        super(model);
    }

    async findByInstituteId(id: string): Promise<Institute> {
        return super._findById(id).then(m => {
            if (!m) {
                throw new InstituteNotFoundError(
                    `Institute not found. id=${id}`
                );
            }
            return mapModelToInstitution(m);
        });
    }

    async retrieve(): Promise<Institute[]> {
        return super._retrieve().then(modelArray => {
            return modelArray.map(m => mapModelToInstitution(m));
        });
    }

    async createInstitute(institution: Institute): Promise<Institute> {
        const newInstitution = new this.model({
            state_short: institution.stateShort,
            name1: institution.name,
            city: institution.city,
            zip: institution.zip,
            phone: institution.phone,
            fax: institution.fax
        });
        return super
            ._create(newInstitution)
            .then(model => createInstitution(model._id.toHexString()));
    }

    async findByInstituteName(name: string): Promise<Institute> {
        return super._findOne({ name1: name }).then(model => {
            if (!model) {
                throw new InstituteNotFoundError(
                    `Institute not found. name=${name}`
                );
            }
            return createInstitution(model._id.toHexString());
        });
    }
}
