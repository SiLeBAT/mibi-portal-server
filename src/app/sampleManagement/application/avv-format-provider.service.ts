import _ from 'lodash';
import moment from 'moment';
import { AVVFormatProvider } from '../model/validation.model';
import { AVVFormatCollection, ParseStateRepository } from '../../ports';
import { injectable, inject } from 'inversify';
import { APPLICATION_TYPES } from './../../application.types';

moment.locale('de');

@injectable()
export class DefaultAVVFormatProvider implements AVVFormatProvider {
    private stateFormats: AVVFormatCollection = {};

    constructor(
        @inject(APPLICATION_TYPES.ParseStateRepository)
        private parseStateRepository: ParseStateRepository
    ) {
        this.parseStateRepository
            .getAllFormats()
            .then(data => (this.stateFormats = data))
            .catch(error => {
                throw error;
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
export function createService(repository: ParseStateRepository): AVVFormatProvider {
    return new DefaultAVVFormatProvider(repository);
}
