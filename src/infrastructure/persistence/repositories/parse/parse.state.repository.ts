import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import {
    ParseStateRepository,
    State,
    AVVFormatCollection
} from '../../../../app/ports';
import {
    State as ParseState,
    SCHEMA_FIELDS as STATE_FIELDS
} from '../../data-store/parse/schema/state';
import { mapToState } from './data-mappers';
import { injectable } from 'inversify';

@injectable()
export class ParseDefaultStateRepository
    extends ParseRepositoryBase<ParseState>
    implements ParseStateRepository
{
    constructor() {
        super();
        super.setClassName(STATE_FIELDS.className);
    }

    async getAllFormats(): Promise<AVVFormatCollection> {
        return this.retrieve().then(states => {
            const collection: AVVFormatCollection = {};
            states.forEach(entry => (collection[entry.short] = entry.AVV));
            return collection;
        });
    }

    private async retrieve(): Promise<State[]> {
        return super._retrieve().then(states => {
            return states.map(state => mapToState(state));
        });
    }
}
