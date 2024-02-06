import { ParseNRLRepository, NRL } from '../../../../app/ports';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';

import { mapToNRL } from './data-mappers';
import { injectable } from 'inversify';
import {
    Nrl as ParseNrl,
    SCHEMA_FIELDS
} from '../../data-store/parse/schema/nrl';
import { AnalysisProcedure } from '../../data-store/parse/schema/analysisprocedure';

@injectable()
export class ParseDefaultNRLRepository
    extends ParseRepositoryBase<ParseNrl>
    implements ParseNRLRepository
{
    constructor() {
        super();
        super.setClassName(SCHEMA_FIELDS.className);
    }

    async retrieve(): Promise<NRL[]> {
        const nrls: ParseNrl[] = await this._retrieveIncludingWith([
            SCHEMA_FIELDS.standardProcedures,
            SCHEMA_FIELDS.optionalProcedures
        ]);

        const nrlsWithStandardProcedures = await Promise.all(
            nrls.map(async (nrl: ParseNrl) => {
                return this._retrieveRelationObjects(
                    nrl.getStandardProcedures()
                ).then((procedures: AnalysisProcedure[]) => {
                    nrl.setStandardProcedureList(procedures);
                    return nrl;
                });
            })
        );
        const populatedNrls = await Promise.all(
            nrlsWithStandardProcedures.map(async (nrl: ParseNrl) => {
                return this._retrieveRelationObjects(
                    nrl.getOptionalProcedures()
                ).then((procedures: AnalysisProcedure[]) => {
                    nrl.setOptionalProcedureList(procedures);
                    return nrl;
                });
            })
        );

        const result = populatedNrls.map(nrl => mapToNRL(nrl));
        return result;
    }
}
