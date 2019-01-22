import { createRepository, IValidationErrorModel, ValidationErrorSchema } from '../data-store';
import { IValidationErrorRepository, IRead } from '../../../app/ports';
import { mapModelToValidationError } from './data-mappers';
import { ValidationError } from '../../../app/sampleManagement/application';
import { ApplicationSystemError } from '../../../app/sharedKernel';
import { logger } from '../../../aspects';
class ValidationErrorRepository implements IValidationErrorRepository {

    constructor(private baseRepo: IRead<IValidationErrorModel>) {
    }

    getAllErrors(): Promise<ValidationError[]> {
        return this.retrieve();
    }

    private retrieve(): Promise<ValidationError[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToValidationError(m));
            }
        ).catch(
            error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load NRL Data');
            }
        );
    }
}

export const repository: IValidationErrorRepository = new ValidationErrorRepository(createRepository(ValidationErrorSchema));
