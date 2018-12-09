import * as _ from 'lodash';
import * as moment from 'moment';
import { IStateRepository, IAVVFormatCollection } from '../../ports';
import { ApplicationSystemError } from '../../sharedKernel/errors';
import { logger } from '../../../aspects';

moment.locale('de');
export interface IAVVFormatPort {
}

export interface IAVVFormatProvider extends IAVVFormatPort {
    getFormat(state?: string): string[];
}

// TODO: should these be in the DB?
class AVVFormatProvider implements IAVVFormatProvider {
    private stateFormats: IAVVFormatCollection = {};

    constructor(private stateRepository: IStateRepository) {
        this.stateRepository.getAllFormats().then(
            data => this.stateFormats = data
        ).catch(
            error => {
                logger.error(error);
                throw new ApplicationSystemError('Unable to load AVV Formats.');
            }
        );
    }
    getFormat(state?: string): string[] {
        let usedFormats = _.flatMap(this.stateFormats);
        if (state) {
            usedFormats = _.flatMap(_.filter(this.stateFormats, (v, k) => k === state));
        }
        return usedFormats;
    }
}
export function createService(repository: IStateRepository): IAVVFormatProvider {
    return new AVVFormatProvider(repository);
}
