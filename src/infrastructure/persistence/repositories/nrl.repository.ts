import { createRepository, NRLSchema, INRLModel } from '../data-store';
import { NRLRepository, Read } from '../../../app/ports';
import { INRL } from '../../../app/sampleManagement/application';
import { mapModelToNRL } from './data-mappers';
import { ApplicationSystemError } from '../../../app/sharedKernel/errors';

class DefaultNRLRepository implements NRLRepository {

    constructor(private baseRepo: Read<INRLModel>) {
    }

    getAllNRLs(): Promise<INRL[]> {
        return this.retrieve();
    }

    private retrieve(): Promise<INRL[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToNRL(m));
            }
        ).catch(
            error => {
                throw new ApplicationSystemError(`Unable to load NRL Data. error=${error}`);
            }
        );
    }
}

export const repository: NRLRepository = new DefaultNRLRepository(createRepository(NRLSchema));
