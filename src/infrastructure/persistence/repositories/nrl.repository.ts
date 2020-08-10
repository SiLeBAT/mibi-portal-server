import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { NRL, NRLRepository } from '../../../app/ports';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { NRLModel } from '../data-store/mongoose/schemas/nrl.schema';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { mapModelToNRL } from './data-mappers';

@injectable()
export class MongooseNRLRepository extends MongooseRepositoryBase<NRLModel>
    implements NRLRepository {
    constructor(@inject(PERSISTENCE_TYPES.NRLModel) model: Model<NRLModel>) {
        super(model);
    }

    async retrieve(): Promise<NRL[]> {
        return this._retrievePopulatedWith([
            'standardProcedures',
            'optionalProcedures'
        ])

            .then(modelArray => {
                return modelArray.map(m => mapModelToNRL(m));
            })
            .catch(error => {
                throw error;
            });
    }
}
