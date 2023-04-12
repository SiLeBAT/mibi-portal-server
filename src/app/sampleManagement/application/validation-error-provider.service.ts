import _ from 'lodash';
import { ParseValidationErrorRepository } from '../../ports';
import {
    ValidationError,
    ValidationErrorProvider
} from './../model/validation.model';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';
import { ValidationErrorCodeNotFoundError } from '../domain/domain.error';

@injectable()
export class DefaultValidationErrorProvider implements ValidationErrorProvider {
    private errors: ValidationError[] = [];

    constructor(
        @inject(APPLICATION_TYPES.ParseValidationErrorRepository)
        private parseValidationErrorRepository: ParseValidationErrorRepository
    ) {
        this.parseValidationErrorRepository
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
