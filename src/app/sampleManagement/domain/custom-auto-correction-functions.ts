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

    let numberOfResults = 20;
    const catalogName = 'adv16';
    const catalog = catalogService.getCatalog(catalogName);
    logger.debug('Initializing auto-correction: Pathogen (ADV-16) & creating closure');
    const options = getFuseOptions();

    const catalogEnhancements = createCatalogEnhancements(catalogService, catalogName);

    const fuse = catalogService.getCatalog(catalogName).getFuzzyIndex(options);

    const searchCache: Record<string, IAutoCorrectedValue> = {};

    return (sample: ISample): IAutoCorrectedValue | null => {
        const sampleData = sample.getData();
        const sampleErrors = sample.getErrors();
        if (!sampleErrors.pathogen_adv) {
            return null;
        }

        const trimmedEntry = sampleData.pathogen_adv.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
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
        let alias: string = '';
        catalogEnhancements.forEach((enhancement: { text: string; alias: string; }) => {
            if (enhancement.alias === trimmedEntry) {
                alias = enhancement.text;
            }
        });
        // Do fuzzy search
        const noSpaceDot = /\.(\S)/g;
        let alteredEntry = trimmedEntry;
        if (noSpaceDot.test(trimmedEntry)) {
            alteredEntry = trimmedEntry.replace(noSpaceDot, '. \$1');
        }
        let result: IFuzzySearchResultEntry[] = fuse.search(alteredEntry);
        if (alias) {
            result = _.filter(result, f => f.item !== alias);
            result.unshift({
                item: alias,
                score: 0
            });
            numberOfResults = 10;
        }
        const slicedResult = result.slice(0, numberOfResults).map(entry => entry.item);
        searchCache[trimmedEntry] = {
            field: 'pathogen_adv' as keyof ISampleData,
            original: sampleData.pathogen_adv,
            correctionOffer: slicedResult
        };
        return searchCache[trimmedEntry];

    };
}

function getFuseOptions() {
    return {
        id: 'Text1',
        shouldSort: true,
        tokenize: true,
        includeScore: true,
        matchAllTokens: true,
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
}

function createCatalogEnhancements(catalogService: ICatalogService, catalogName: string) {
    return _(catalogService.getCatalogSearchAliases(catalogName))
        .map((e: ISearchAlias) => {
            return e.alias.map(alias => ({
                text: e.token,
                alias: alias
            }));
        })
        .flattenDeep()
        .value();
}

export {
    autoCorrectPathogen
};
