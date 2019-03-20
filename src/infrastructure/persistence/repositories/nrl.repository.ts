import {
    NRLRepository,
    Read,
    ApplicationSystemError,
    NRLConfig
} from '../../../app/ports';
import { mapModelToNRL } from './data-mappers';
import { NRLModel } from '../data-store/mongoose/schemas/nrl.schema';
import { createRepository } from '../data-store/mongoose/mongoose.repository';
import { NRLSchema } from '../data-store/mongoose/mongoose';

class DefaultNRLRepository implements NRLRepository {
    constructor(private baseRepo: Read<NRLModel>) {}

    getAllNRLs(): Promise<NRLConfig[]> {
        return this.retrieve();
    }

    private retrieve(): Promise<NRLConfig[]> {
        return this.baseRepo
            .retrieve()
            .then(modelArray => {
                return modelArray.map(m => mapModelToNRL(m));
            })
            .catch(error => {
                throw new ApplicationSystemError(
                    `Unable to load NRL Data. error=${error}`
                );
            });
    }
}

export const repository: NRLRepository = new DefaultNRLRepository(
    createRepository(NRLSchema)
);
