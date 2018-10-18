import * as _ from 'lodash';
import * as moment from 'moment';
import { IStateRepository, IAVVFormatCollection } from '../../ports';
import { ApplicationSystemError } from '../../sharedKernel/errors';
import { logger } from '../../../aspects';

moment.locale('de');
export interface IAVVFormatPort {
}

export interface IAVVFormatProvider extends IAVVFormatPort {
    getFormat(state?: string): RegExp[];
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
    getFormat(state?: string): RegExp[] {
        const currentYear = moment();
        const lastYear = moment().subtract(1, 'year');
        const nextYear = moment().add(1, 'year');
        let usedFormats = _.flatMap(this.stateFormats);
        if (state) {
            usedFormats = _.flatMap(_.filter(this.stateFormats, (v, k) => k === state));
        }
        return _.flatMap(usedFormats,
            (entry: string) => {
                const result: RegExp[] = [];
                if (entry.includes('yyyy+1')) {
                    const currentEntry = entry.replace('yyyy+1', nextYear.format('YYYY'));
                    const lastEntry = entry.replace('yyyy', currentYear.format('YYYY'));
                    result.push(new RegExp(currentEntry));
                    result.push(new RegExp(lastEntry));
                } else if (entry.includes('yyyy')) {
                    const currentEntry = entry.replace('yyyy', currentYear.format('YYYY'));
                    const lastEntry = entry.replace('yyyy', lastYear.format('YYYY'));
                    result.push(new RegExp(currentEntry));
                    result.push(new RegExp(lastEntry));
                } else if (entry.includes('yy+1')) {
                    const currentEntry = entry.replace('yy+1', nextYear.format('YY'));
                    const lastEntry = entry.replace('yy', currentYear.format('YY'));
                    result.push(new RegExp(currentEntry));
                    result.push(new RegExp(lastEntry));
                } else if (entry.includes('yy')) {
                    const currentEntry = entry.replace('yy', currentYear.format('YY'));
                    const lastEntry = entry.replace('yy', lastYear.format('YY'));
                    result.push(new RegExp(currentEntry));
                    result.push(new RegExp(lastEntry));
                } else {
                    result.push(new RegExp(entry));
                }
                return result;
            }
        );
    }
}
export function createService(repository: IStateRepository): IAVVFormatProvider {
    return new AVVFormatProvider(repository);
}
