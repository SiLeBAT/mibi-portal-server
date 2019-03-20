import { createRepository } from '../data-store/mongoose/mongoose.repository';
import { StateSchema } from '../data-store/mongoose/mongoose';
import {
    StateRepository,
    State,
    AVVFormatCollection,
    Read
} from '../../../app/ports';
import { mapModelToState } from './data-mappers';
import { StateModel } from '../data-store/mongoose/schemas/state.schema';

class DefaultStateRepository implements StateRepository {
    constructor(private baseRepo: Read<StateModel>) {}

    getAllFormats(): Promise<AVVFormatCollection> {
        return this.retrieve().then(states => {
            const collection: AVVFormatCollection = {};
            states.forEach(entry => (collection[entry.short] = entry.AVV));
            return collection;
        });
    }

    private retrieve(): Promise<State[]> {
        return this.baseRepo.retrieve().then(modelArray => {
            return modelArray.map(m => mapModelToState(m));
        });
    }
}

export const repository: StateRepository = new DefaultStateRepository(
    createRepository(StateSchema)
);
