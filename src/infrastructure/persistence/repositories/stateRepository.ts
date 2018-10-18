import { createRepository, StateSchema, IStateModel } from './../dataStore';
import { IRepositoryBase, IStateRepository, IState, IAVVFormatCollection } from './../../../app/ports';
import { mapModelToState } from './dataMappers';

class StateRepository implements IStateRepository {

    constructor(private baseRepo: IRepositoryBase<IStateModel>) {
    }

    getAllFormats(): Promise<IAVVFormatCollection> {
        return this.retrieve().then(
            states => {
                const collection: IAVVFormatCollection = {};
                states.forEach(
                    entry => collection[entry.short] = entry.AVV
                );
                return collection;
            }
        );
    }

    retrieve(): Promise<IState[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToState(m));
            }
        );
    }
}

export const repository: IStateRepository = new StateRepository(createRepository(StateSchema));
