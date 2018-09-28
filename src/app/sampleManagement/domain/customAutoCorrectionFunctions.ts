import * as _ from 'lodash';
import { ISample, IAutoCorrectedValue, ISampleData } from './sample.entity';
import { ICatalogService } from '../application';
import { logger } from '../../../aspects';

export interface ICorrectionFunction {
    (sample: ISample): IAutoCorrectedValue | null;
}

export interface ISearchAlias {
    catalog: string;
    token: string;
    alias: string[];
}

interface IFuzzySearchResultEntry {
    item: string;
    score: number;
}
// ADV16
function autoCorrectPathogen(catalogService: ICatalogService) {

    const catalogName = 'adv16';
    logger.debug('Initializing auto-correction: Pathogen (ADV-16) & creating closure');
    const options = {
        shouldSort: true,
        includeScore: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        id: 'Text1',
        keys: [
            'Text1',
            'P-Code3',
            'Kode'
        ]
    };

    const enhancements = _(catalogService.getCatalogSearchAliases(catalogName))
        .map((e: ISearchAlias) => {
            return e.alias.map(alias => ({
                Text1: e.token,
                'P-Code3': alias
            }));
        })
        .flattenDeep()
        .value();

    const fuse = catalogService.getCatalog(catalogName).getFuzzyIndex(options, enhancements);

    const searchCache: Record<string, IFuzzySearchResultEntry[]> = {};

    return (sample: ISample): IAutoCorrectedValue | null => {
        const sampleData = sample.getData();
        let result: IFuzzySearchResultEntry[] = [];
        if (sampleData.pathogen_adv.replace(/\s/g, '').length) {
            if (searchCache[sampleData.pathogen_adv]) {
                result = searchCache[sampleData.pathogen_adv];
            } else {
                result = fuse.search(sampleData.pathogen_adv);
                searchCache[sampleData.pathogen_adv] = result;
            }
            if (result.length) {
                if (sampleData.pathogen_adv.localeCompare(result[0].item) !== 0) {
                    return {
                        field: 'pathogen_adv' as keyof ISampleData,
                        original: sampleData.pathogen_adv,
                        corrected: result[0].item
                    };
                }
            }
        }
        return null;
    };
}

export {
    autoCorrectPathogen
};
