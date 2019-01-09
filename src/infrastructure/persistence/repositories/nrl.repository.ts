import { createRepository, NRLSchema, INRLModel } from '../data-store';
import { INRLRepository, IRead } from '../../../app/ports';
import { INRL } from '../../../app/sampleManagement/application';
import { mapModelToNRL } from './data-mappers';
import { ApplicationSystemError } from '../../../app/sharedKernel/errors';

class NRLRepository implements INRLRepository {

    constructor(private baseRepo: IRead<INRLModel>) {
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

export const repository: INRLRepository = new NRLRepository(createRepository(NRLSchema));
