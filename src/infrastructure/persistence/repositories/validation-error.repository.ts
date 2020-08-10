import { inject, injectable } from 'inversify';
import { Model } from 'mongoose';
import { ValidationError, ValidationErrorRepository } from '../../../app/ports';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { ValidationErrorModel } from '../data-store/mongoose/schemas/validation-error.schema';
import { PERSISTENCE_TYPES } from '../persistence.types';
import { mapModelToValidationError } from './data-mappers';

@injectable()
export class DefaultValidationErrorRepository
    extends MongooseRepositoryBase<ValidationErrorModel>
    implements ValidationErrorRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.ValidationErrorModel)
        model: Model<ValidationErrorModel>
    ) {
        super(model);
    }

    async getAllErrors(): Promise<ValidationError[]> {
        return super
            ._retrieve()
            .then(modelArray => {
                return modelArray.map(m => mapModelToValidationError(m));
            })
            .catch(error => {
                throw error;
            });
    }
}
