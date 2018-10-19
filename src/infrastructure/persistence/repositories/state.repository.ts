import { createRepository, StateSchema, IStateModel } from '../data-store';
import { IStateRepository, IState, IAVVFormatCollection, IRead } from '../../../app/ports';
import { mapModelToState } from './data-mappers';

class StateRepository implements IStateRepository {

    constructor(private baseRepo: IRead<IStateModel>) {
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

    private retrieve(): Promise<IState[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToState(m));
            }
        );
    }
}

export const repository: IStateRepository = new StateRepository(createRepository(StateSchema));
