import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import {
    AVVFormatCollection,
    State,
    StateRepository
} from '../../../app/ports';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { StateModel } from '../data-store/mongoose/schemas/state.schema';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { mapModelToState } from './data-mappers';

@injectable()
export class DefaultStateRepository extends MongooseRepositoryBase<StateModel>
    implements StateRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.StateModel) model: Model<StateModel>
    ) {
        super(model);
    }

    async getAllFormats(): Promise<AVVFormatCollection> {
        return this.retrieve().then(states => {
            const collection: AVVFormatCollection = {};
            states.forEach(entry => (collection[entry.short] = entry.AVV));
            return collection;
        });
    }

    private async retrieve(): Promise<State[]> {
        return super._retrieve().then(modelArray => {
            return modelArray.map(m => mapModelToState(m));
        });
    }
}
