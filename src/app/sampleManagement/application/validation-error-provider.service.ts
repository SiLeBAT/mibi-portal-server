import * as _ from 'lodash';
import { ApplicationDomainError, ApplicationSystemError } from '../../sharedKernel';
import { IValidationErrorRepository } from '../../ports';
import { logger } from '../../../aspects';

export interface IValidationErrorProviderPort {
}

export interface IValidationErrorProvider extends IValidationErrorProviderPort {
    getError(id: number): IValidationError;
}

export interface IValidationError {
    code: number;
    level: number;
    message: string;
}

class ValidationErrorProvider implements IValidationErrorProvider {
    private errors: IValidationError[] = [];

    constructor(private validationErrorRepository: IValidationErrorRepository) {
        this.validationErrorRepository.getAllErrors().then(
            data => this.errors = data
        ).catch(
            error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load AVV Formats.');
            }
        );
    }

    getError(id: number): IValidationError {
        const error = _.find(this.errors, e => e.code === id);
        if (!error) {
            throw new ApplicationDomainError(`Error code not found, id=${id}`);
        }
        return error;
    }
}

export function createService(repository: IValidationErrorRepository): IValidationErrorProvider {
    return new ValidationErrorProvider(repository);
}
