import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { ValidationErrorRepository } from '../../ports';
import { ValidationErrorCodeNotFoundError } from '../domain/domain.error';
import { APPLICATION_TYPES } from './../../application.types';
import {
    ValidationError,
    ValidationErrorProvider
} from './../model/validation.model';

@injectable()
export class DefaultValidationErrorProvider implements ValidationErrorProvider {
    private errors: ValidationError[] = [];

    constructor(
        @inject(APPLICATION_TYPES.ValidationErrorRepository)
        private validationErrorRepository: ValidationErrorRepository
    ) {
        this.validationErrorRepository
            .getAllErrors()
            .then(data => (this.errors = data))
            .catch(error => {
                throw error;
            });
    }

    getError(code: number): ValidationError {
        const error = _.find(this.errors, e => e.code === code);
        if (!error) {
            throw new ValidationErrorCodeNotFoundError(
                `Error code not found, code=${code}`
            );
        }
        return error;
    }
}
