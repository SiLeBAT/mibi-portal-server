import { injectable } from 'inversify';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import { Institution, SCHEMA_FIELDS } from '../../data-store/parse/schema/institution';
import {
    ParseInstituteRepository,
    Institute,
    createInstitution
} from '../../../../app/ports';
import { mapToInstitution } from './data-mappers';
import { InstituteNotFoundError } from '../../model/domain.error';

@injectable()
export class ParseDefaultInstituteRepository
    extends ParseRepositoryBase<Institution>
    implements ParseInstituteRepository
{

    constructor() {
        super();
        super.setClassName(SCHEMA_FIELDS.className);
    }

    async retrieve(): Promise<Institute[]> {
        return super
            ._retrieve()
            .then((institutions: Institution[]) => {
            return institutions.map(institution => mapToInstitution(institution));
        });
    }

    async findByInstituteId(id: string): Promise<Institute> {
        return super._findById(id)
            .then((institution: Institution) => {
            if (!institution) {
                throw new InstituteNotFoundError(
                    `Institute not found. id=${id}`
                );
            }
            return mapToInstitution(institution);
        });
    }

    async findByInstituteName(name: string): Promise<Institute> {
        return super._findOne(SCHEMA_FIELDS.name1, name)
            .then(institution => {
            if (!institution) {
                throw new InstituteNotFoundError(
                    `Institute not found. name=${name}`
                );
            }
            return createInstitution(institution.getId());
        });
    }

    async createInstitute(institution: Institute): Promise<Institute> {
        const newInstitution = new Institution({
            state_short: institution.stateShort,
            name1: institution.name,
            city: institution.city,
            zip: institution.zip,
            phone: institution.phone,
            fax: institution.fax
        });

        return super
            ._create(newInstitution)
            .then(institution => createInstitution(institution.getId()));
    }
}
