import { createRepository, IValidationErrorModel, ValidationErrorSchema } from '../data-store';
import { IValidationErrorRepository, IRead } from '../../../app/ports';
import { mapModelToValidationError } from './data-mappers';
import { IValidationError } from '../../../app/sampleManagement/application';

class ValidationErrorRepository implements IValidationErrorRepository {

    constructor(private baseRepo: IRead<IValidationErrorModel>) {
    }

    getAllErrors(): Promise<IValidationError[]> {
        return this.retrieve();
    }

    private retrieve(): Promise<IValidationError[]> {
        return this.baseRepo.retrieve().then(
            modelArray => {
                return modelArray.map(m => mapModelToValidationError(m));
            }
        );
    }
}

export const repository: IValidationErrorRepository = new ValidationErrorRepository(createRepository(ValidationErrorSchema));
