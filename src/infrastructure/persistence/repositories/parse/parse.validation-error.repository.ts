import { ParseValidationErrorRepository, ValidationError } from '../../../../app/ports';
import { mapToValidationError } from './data-mappers';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import { injectable } from 'inversify';
import { ValidationError as ParseValidationError, SCHEMA_FIELDS as ERROR_FIELDS } from '../../data-store/parse/schema/validationerror';

@injectable()
export class ParseDefaultValidationErrorRepository
    extends ParseRepositoryBase<ParseValidationError>
    implements ParseValidationErrorRepository
{
    constructor() {
        super();
        super.setClassName(ERROR_FIELDS.className);
    }

    async getAllErrors(): Promise<ValidationError[]> {
        return super
            ._retrieve()
            .then(errors => {
                return errors.map(error => mapToValidationError(error));
            })
            .catch(error => {
                throw error;
            });
    }
}
