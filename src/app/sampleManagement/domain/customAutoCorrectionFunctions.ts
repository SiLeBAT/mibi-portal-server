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
// ADV16: see #mps53
function autoCorrectPathogen(catalogService: ICatalogService) {

    const numberOfResults = 20;
    const catalogName = 'adv16';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Pathogen (ADV-16) & creating closure');
    const options = {
        id: 'Text1',
        shouldSort: true,
        tokenize: true,
        includeScore: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 100,
        minMatchCharLength: 1,
        keys: [
            {
                'name': 'Text1',
                'weight': 0.9
            },
            {
                'name': 'P-Code3',
                'weight': 0.1
            }
        ]
    };

    const catalogEnhancements = _(catalogService.getCatalogSearchAliases(catalogName))
        .map((e: ISearchAlias) => {
            return e.alias.map(alias => ({
                text: e.token,
                alias: alias
            }));
        })
        .flattenDeep()
        .value();

    const fuse = catalogService.getCatalog(catalogName).getFuzzyIndex(options);

    const searchCache: Record<string, IAutoCorrectedValue> = {};

    return (sample: ISample): IAutoCorrectedValue | null => {
        const sampleData = sample.getData();
        const sampleErrors = sample.getErrors();
        if (sampleErrors.pathogen_adv) {
            const trimmedEntry = sampleData.pathogen_adv.trim();
            // Ignore empty entries
            if (!trimmedEntry) {
                return null;
            }
            if (searchCache[sampleData.pathogen_adv]) {
                return searchCache[trimmedEntry];
            }
            // Ignore numbers only
            const numbersOnly = /^\d+$/;
            if (numbersOnly.test(trimmedEntry)) {
                return null;
            }
            // Search for Genus
            const genusEntry = 'Genus ' + trimmedEntry;
            if (catalog.containsEntryWithKeyValue('Text1', genusEntry)) {
                searchCache[trimmedEntry] = {
                    field: 'pathogen_adv' as keyof ISampleData,
                    original: sampleData.pathogen_adv,
                    correctionOffer: [genusEntry]
                };
                return searchCache[trimmedEntry];
            }

            // Search catalog enhancements
            catalogEnhancements.forEach((enhancement: { text: string; alias: string; }) => {
                if (enhancement.alias === trimmedEntry) {
                    searchCache[trimmedEntry] = {
                        field: 'pathogen_adv' as keyof ISampleData,
                        original: sampleData.pathogen_adv,
                        correctionOffer: [enhancement.text]
                    };
                    return searchCache[trimmedEntry];
                }
            });

            // Do fuzzy search
            const noSpaceDot = /\.(\S)/g;
            let alteredEntry = trimmedEntry;
            if (noSpaceDot.test(trimmedEntry)) {
                alteredEntry = trimmedEntry.replace(noSpaceDot, '. \$1');
            }
            const result: IFuzzySearchResultEntry[] = fuse.search(alteredEntry);
            const slicedResult = result.slice(0, numberOfResults).map(entry => entry.item);
            searchCache[trimmedEntry] = {
                field: 'pathogen_adv' as keyof ISampleData,
                original: sampleData.pathogen_adv,
                correctionOffer: slicedResult
            };
            return searchCache[trimmedEntry];

        }
        return null;
    };
}

export {
    autoCorrectPathogen
};
