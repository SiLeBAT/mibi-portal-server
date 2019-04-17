import * as _ from 'lodash';
import * as moment from 'moment';
import { logger } from '../../../aspects';
import { AVVFormatProvider } from '../model/validation.model';
import { ApplicationSystemError } from '../../core/domain/technical.error';
import { AVVFormatCollection, StateRepository } from '../../ports';

moment.locale('de');

// TODO: should these be in the DB?
class DefaultAVVFormatProvider implements AVVFormatProvider {
    private stateFormats: AVVFormatCollection = {};

    constructor(private stateRepository: StateRepository) {
        this.stateRepository
            .getAllFormats()
            .then(data => (this.stateFormats = data))
            .catch(error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load AVV Formats.');
            });
    }
    getFormat(state?: string): string[] {
        let usedFormats = _.flatMap(this.stateFormats);
        if (state) {
            usedFormats = _.flatMap(
                _.filter(this.stateFormats, (v, k) => k === state)
            );
        }
        return usedFormats;
    }
}
export function createService(repository: StateRepository): AVVFormatProvider {
    return new DefaultAVVFormatProvider(repository);
}
