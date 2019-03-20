import * as _ from 'lodash';
import { ValidationErrorRepository } from '../../ports';
import { logger } from '../../../aspects';
import { ApplicationDomainError } from './../../core/domain/domain.error';
import { ApplicationSystemError } from './../../core/domain/technical.error';
import {
    ValidationError,
    ValidationErrorProvider
} from './../model/validation.model';

class DefaultValidationErrorProvider implements ValidationErrorProvider {
    private errors: ValidationError[] = [];

    constructor(private validationErrorRepository: ValidationErrorRepository) {
        this.validationErrorRepository
            .getAllErrors()
            .then(data => (this.errors = data))
            .catch(error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load AVV Formats.');
            });
    }

    getError(code: number): ValidationError {
        const error = _.find(this.errors, e => e.code === code);
        if (!error) {
            throw new ApplicationDomainError(
                `Error code not found, code=${code}`
            );
        }
        return error;
    }
}

export function createService(
    repository: ValidationErrorRepository
): ValidationErrorProvider {
    return new DefaultValidationErrorProvider(repository);
}
