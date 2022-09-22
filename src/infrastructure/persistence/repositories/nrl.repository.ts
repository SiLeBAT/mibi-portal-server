import { NRLRepository, NRL } from '../../../app/ports';
import { mapToNRL } from './data-mappers';
import { NrlDocument } from '../data-store/mongoose/schemas/nrl.schema';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { injectable, inject } from 'inversify';
import { Model } from 'mongoose';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { AnalysisProcedureDocument } from '../data-store/mongoose/schemas/analysis-prodecure.schema';

@injectable()
export class MongooseNRLRepository
    extends MongooseRepositoryBase<NrlDocument>
    implements NRLRepository
{
    constructor(@inject(PERSISTENCE_TYPES.NRLModel) model: Model<NrlDocument>) {
        super(model);
    }

    async retrieve(): Promise<NRL[]> {
        return this._retrievePopulatedWith<{
            standardProcedures: AnalysisProcedureDocument[];
            optionalProcedures: AnalysisProcedureDocument[];
        }>(['standardProcedures', 'optionalProcedures'])

            .then(docs => {
                return docs.map(doc => mapToNRL(doc));
            })
            .catch(error => {
                throw error;
            });
    }
}
