import { NRL, ParseNRLRepository } from '../../../../app/ports';

import { injectable } from 'inversify';
import { mapToNRL } from './data-mappers';

@injectable()
export class ParseDefaultNRLRepository implements ParseNRLRepository {
    async retrieve(): Promise<NRL[]> {
        const query = new Parse.Query('NRL');
        query.include('standardProcedures');
        query.include('optionalProcedures');
        const nrlObjects: Parse.Object[] = await query.find();
        const result = nrlObjects.map(nrl => mapToNRL(nrl));
        return result;
    }
}
