import {
    ValidationErrorRepository,
    ApplicationSystemError,
    ValidationError
} from '../../../app/ports';
import { mapModelToValidationError } from './data-mappers';
import { logger } from '../../../aspects';
import { ValidationErrorModel } from '../data-store/mongoose/schemas/validationError.schema';
import { ValidationErrorSchema } from '../data-store/mongoose/mongoose';
import {
    createRepository,
    Read
} from '../data-store/mongoose/mongoose.repository';
class DefaultValidationErrorRepository implements ValidationErrorRepository {
    constructor(private baseRepo: Read<ValidationErrorModel>) {}

    getAllErrors(): Promise<ValidationError[]> {
        return this.retrieve();
    }

    private retrieve(): Promise<ValidationError[]> {
        return this.baseRepo
            .retrieve()
            .then(modelArray => {
                return modelArray.map(m => mapModelToValidationError(m));
            })
            .catch(error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load NRL Data');
            });
    }
}

export const repository: ValidationErrorRepository = new DefaultValidationErrorRepository(
    createRepository(ValidationErrorSchema)
);
