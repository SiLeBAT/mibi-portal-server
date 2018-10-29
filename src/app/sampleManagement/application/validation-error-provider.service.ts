import * as _ from 'lodash';
import { ApplicationDomainError, ApplicationSystemError } from '../../sharedKernel';
import { IValidationErrorRepository } from '../../ports';
import { logger } from '../../../aspects';

export interface ValidationErrorProviderPort {
}

export interface ValidationErrorProvider extends ValidationErrorProviderPort {
    getError(id: number): ValidationError;
}

export interface ValidationError {
    code: number;
    level: number;
    message: string;
}

class DefaultValidationErrorProvider implements ValidationErrorProvider {
    private errors: ValidationError[] = [];

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

    getError(code: number): ValidationError {
        const error = _.find(this.errors, e => e.code === code);
        if (!error) {
            throw new ApplicationDomainError(`Error code not found, code=${code}`);
        }
        return error;
    }
}

export function createService(repository: IValidationErrorRepository): ValidationErrorProvider {
    return new DefaultValidationErrorProvider(repository);
}
