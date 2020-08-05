import _ from 'lodash';
import Fuse from 'fuse.js';
import { logger } from '../../../aspects';
import { SampleData, SampleProperty } from '../model/sample.model';
import {
    CorrectionSuggestions,
    SearchAlias,
    CatalogEnhancement,
    ResultOptions,
    CorrectionFunction
} from '../model/autocorrection.model';
import {
    CatalogService,
    ADVCatalogEntry,
    ADV9CatalogEntry
} from '../model/catalog.model';

function autoCorrectADV2(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv2';
    const dependencyCatalogName = 'adv3';
    const property: SampleProperty = 'topic_adv';
    const dependencyProperty: SampleProperty = 'matrix_adv';
    const catalog = catalogService.getCatalog<ADVCatalogEntry>(catalogName);
    const dependencyCatalog = catalogService.getCatalog<ADVCatalogEntry>(
        dependencyCatalogName
    );
    logger.debug(
        'Initializing auto-correction: Topic (ADV-2) & creating closure'
    );

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        let trimmedEntry = originalValue.trim();

        const dependencies = dependencyCatalog.getEntriesWithKeyValue(
            'Kode',
            sampleData[dependencyProperty].value
        );

        if (dependencies.length === 0) {
            if (
                trimmedEntry !== originalValue &&
                catalog.containsUniqueEntryWithId(trimmedEntry)
            ) {
                return createCacheEntry(
                    property,
                    originalValue,
                    [catalog.getUniqueEntryWithId(trimmedEntry).Kode],
                    94
                );
            }
            return null;
        } else if (dependencies.length === 1) {
            const value = dependencies[0]['Kodiersystem'];
            if (originalValue === value) {
                if (
                    trimmedEntry !== originalValue &&
                    catalog.containsUniqueEntryWithId(trimmedEntry)
                ) {
                    return createCacheEntry(
                        property,
                        originalValue,
                        [catalog.getUniqueEntryWithId(trimmedEntry)['Kode']],
                        93
                    );
                }
                return null;
            } else {
                return createCacheEntry(property, originalValue, [value], 93);
            }
        }
        return null;
    };
}

function autoCorrectADV12(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv12';
    const property: SampleProperty = 'process_state_adv';
    const catalog = catalogService.getCatalog<ADVCatalogEntry>(catalogName);
    logger.debug(
        'Initializing auto-correction: Process state (ADV-12) & creating closure'
    );

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        const trimmedEntry = originalValue.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[trimmedEntry]) {
            logger.trace('Returning cached result for ', trimmedEntry);
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        let alteredEntry = checkAndUnshift(trimmedEntry, /^\d{2}$/, '0');
        if (alteredEntry && catalog.containsUniqueEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [catalog.getUniqueEntryWithId(alteredEntry)['Kode']],
                92
            );
            return searchCache[trimmedEntry];
        }

        if (catalog.containsEntryWithKeyValue('Text', trimmedEntry)) {
            searchCache[trimmedEntry] = {
                field: property,
                original: originalValue,
                correctionOffer: [
                    catalog.getEntriesWithKeyValue('Text', trimmedEntry)[0][
                        'Kode'
                    ]
                ],
                code: 92
            };
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

function autoCorrectADV3(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv3';
    const property: SampleProperty = 'matrix_adv';
    const catalog = catalogService.getCatalog<ADVCatalogEntry>(catalogName);
    logger.debug(
        'Initializing auto-correction: Matrix (ADV-3) & creating closure'
    );

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        const trimmedEntry = originalValue.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[trimmedEntry]) {
            logger.trace('Returning cached result for ', trimmedEntry);
            return searchCache[trimmedEntry];
        }

        if (
            trimmedEntry !== originalValue &&
            catalog.containsEntryWithKeyValue('Kode', trimmedEntry)
        ) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [trimmedEntry],
                91
            );
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        let alteredEntry = checkAndUnshift(trimmedEntry, /^\d{5}$/, '0');
        if (
            alteredEntry &&
            catalog.containsEntryWithKeyValue('Kode', alteredEntry)
        ) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [alteredEntry],
                91
            );
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

function autoCorrectADV8(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv8';
    const property: SampleProperty = 'operations_mode_adv';
    const catalog = catalogService.getCatalog<ADVCatalogEntry>(catalogName);
    logger.debug(
        'Initializing auto-correction: Operations Mode (ADV-8) & creating closure'
    );

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        let trimmedEntry = originalValue.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[trimmedEntry]) {
            logger.trace('Returning cached result for ', trimmedEntry);
            return searchCache[trimmedEntry];
        }

        if (
            trimmedEntry !== originalValue &&
            catalog.containsUniqueEntryWithId(trimmedEntry)
        ) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [catalog.getUniqueEntryWithId(trimmedEntry)['Kode']],
                90
            );
            return searchCache[trimmedEntry];
        }

        // Check Number codes
        const replacements = [
            {
                pattern: /x$/,
                replacement: '0'
            },
            {
                pattern: /xx$/,
                replacement: '00'
            },
            {
                pattern: /xxx$/,
                replacement: '000'
            },
            {
                pattern: /xxxx$/,
                replacement: '0000'
            },
            {
                pattern: /xxxxx$/,
                replacement: '00000'
            },
            {
                pattern: /xxxxxx$/,
                replacement: '000000'
            }
        ];

        for (let rep of replacements) {
            let alteredEntry = checkAndReplace(
                trimmedEntry,
                rep.pattern,
                rep.replacement
            );
            if (
                alteredEntry &&
                catalog.containsUniqueEntryWithId(alteredEntry)
            ) {
                searchCache[trimmedEntry] = createCacheEntry(
                    property,
                    originalValue,
                    [catalog.getUniqueEntryWithId(alteredEntry)['Kode']],
                    90
                );
                return searchCache[trimmedEntry];
            }
        }

        return null;
    };
}

function autoCorrectADV9(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv9';
    const property: SampleProperty = 'sampling_location_adv';
    const catalog = catalogService.getCatalog<ADV9CatalogEntry>(catalogName);
    logger.debug(
        'Initializing auto-correction: Sampling location (ADV-9) & creating closure'
    );

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        const trimmedEntry = originalValue.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[trimmedEntry]) {
            logger.trace('Returning cached result for ', trimmedEntry);
            return searchCache[trimmedEntry];
        }

        if (
            trimmedEntry !== originalValue &&
            catalog.containsUniqueEntryWithId(trimmedEntry)
        ) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [catalog.getUniqueEntryWithId(trimmedEntry)['Kode']],
                89
            );
            return searchCache[trimmedEntry];
        }
        // Check Number codes
        let alteredEntry = checkAndReplace(trimmedEntry, /xxx$/, '');
        if (alteredEntry && catalog.containsUniqueEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [catalog.getUniqueEntryWithId(alteredEntry)['Kode']],
                89
            );
            return searchCache[trimmedEntry];
        }

        alteredEntry = checkAndUnshift(trimmedEntry, /^\d{7}$/, '0');
        if (alteredEntry && catalog.containsUniqueEntryWithId(alteredEntry)) {
            searchCache[trimmedEntry] = createCacheEntry(
                property,
                originalValue,
                [catalog.getUniqueEntryWithId(alteredEntry)['Kode']],
                89
            );
            return searchCache[trimmedEntry];
        }

        return null;
    };
}

// ADV16: see #mps53
function autoCorrectADV16(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'adv16';
    const property: SampleProperty = 'pathogen_adv';
    const catalog = catalogService.getCatalog<ADVCatalogEntry>(catalogName);
    logger.debug(
        'Initializing auto-correction: Pathogen (ADV-16) & creating closure'
    );
    const options = getFuseOptions();

    const catalogEnhancements = createCatalogEnhancements(
        catalogService,
        catalogName
    ) as CatalogEnhancement[];

    const fuse = catalogService
        .getCatalog<ADVCatalogEntry>(catalogName)
        .getFuzzyIndex(options);

    const searchCache: Record<string, CorrectionSuggestions> = {};

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[property].value;
        let trimmedEntry = originalValue.trim();
        // Ignore empty entries
        if (!trimmedEntry) {
            return null;
        }
        // Return cached result
        if (searchCache[trimmedEntry]) {
            logger.trace('Returning cached result for ', trimmedEntry);
            return searchCache[trimmedEntry];
        }

        if (catalog.containsEntryWithKeyValue('Text', trimmedEntry)) {
            return null;
        }

        // Check Number codes
        const numbersOnly = /^\d+$/;
        if (numbersOnly.test(trimmedEntry)) {
            trimmedEntry =
                checkAndUnshift(trimmedEntry, /^\d{6}$/, '0') || trimmedEntry;
            if (catalog.containsUniqueEntryWithId(trimmedEntry)) {
                searchCache[trimmedEntry] = createCacheEntry(
                    property,
                    originalValue,
                    [catalog.getUniqueEntryWithId(trimmedEntry)['Text']],
                    87
                );
                return searchCache[trimmedEntry];
            }
        }

        // Search for Genus
        const genusEntry = 'Genus ' + trimmedEntry;
        if (catalog.containsEntryWithKeyValue('Text', genusEntry)) {
            searchCache[trimmedEntry] = {
                field: property,
                original: originalValue,
                correctionOffer: [genusEntry],
                code: 88
            };
            return searchCache[trimmedEntry];
        }

        // Search catalog enhancements
        const alias: string = searchCatalogEnhancements(
            trimmedEntry,
            catalogEnhancements
        );

        // Do fuzzy search
        const noSpaceDot = /\.(\S)/g;
        let alteredEntry = trimmedEntry;
        if (noSpaceDot.test(trimmedEntry)) {
            alteredEntry = trimmedEntry.replace(noSpaceDot, '. $1');
        }

        const resultOptions: ResultOptions = {
            property,
            numberOfResults: 20,
            alias,
            original: originalValue
        };
        searchCache[trimmedEntry] = doFuzzySearch(
            alteredEntry,
            fuse,
            resultOptions
        );
        return searchCache[trimmedEntry];
    };
}

// Utility functions
function createCacheEntry(
    field: SampleProperty,
    original: string,
    correctionOffer: string[],
    code: number
) {
    return {
        field,
        original,
        correctionOffer,
        code
    };
}

function checkAndReplace(value: string, predicate: RegExp, substitute: string) {
    if (predicate.test(value)) {
        return value.replace(predicate, substitute);
    }
    return '';
}

function checkAndUnshift(value: string, predicate: RegExp, pre: string) {
    if (predicate.test(value)) {
        return pre + value;
    }
    return '';
}

function doFuzzySearch(
    value: string,
    fuse: Fuse<ADVCatalogEntry>,
    options: ResultOptions
) {
    let { property, numberOfResults, alias, original } = { ...options };

    // remove fuse extended search flags
    value = value.replace(/[|='!^$]/g, ' ');
    // remove special chars
    value = value.replace(/[,.;]/g, ' ');

    let fuseResults = fuse.search(value);
    // sort first by score, second alphabetically
    fuseResults.sort((a, b) => a.item.Text.localeCompare(b.item.Text));
    fuseResults.sort((a, b) => (a.score as number) - (b.score as number));

    let result = fuseResults.map(v => v.item.Text);
    if (alias) {
        result = [alias].concat(_.filter(result, f => f !== alias));
        numberOfResults = 10;
    }
    const slicedResult = result.slice(0, numberOfResults);
    return {
        field: property,
        original: original,
        correctionOffer: slicedResult,
        code: 0
    };
}

function searchCatalogEnhancements(
    value: string,
    catalogEnhancements: CatalogEnhancement[]
): string {
    let alias: string = '';
    catalogEnhancements.forEach(enhancement => {
        const cleanedAlias = cleanText(enhancement.alias);
        const cleanedValue = cleanText(value);
        if (cleanedAlias === cleanedValue) {
            alias = enhancement.text;
        }
    });
    return alias;
}

function cleanText(str: string) {
    let cleaned = str.replace(',', '');
    cleaned = cleaned.replace(/\s*/g, '');
    return cleaned.toLowerCase();
}

function getFuseOptions(): Fuse.IFuseOptions<ADVCatalogEntry> {
    return {
        shouldSort: false,
        includeScore: true,
        threshold: 0.6,
        minMatchCharLength: 1,
        ignoreLocation: true,
        useExtendedSearch: true, // searching for each space delimited substring
        keys: [
            {
                name: 'Text',
                weight: 0.9
            },
            {
                name: 'P-Code3',
                weight: 0.1
            }
        ]
    };
}

function createCatalogEnhancements(
    catalogService: CatalogService,
    catalogName: string
) {
    return _(catalogService.getCatalogSearchAliases(catalogName))
        .map((e: SearchAlias) => {
            return e.alias.map(alias => ({
                text: e.token,
                alias: alias
            }));
        })
        .flattenDeep()
        .value();
}

export {
    autoCorrectADV16,
    autoCorrectADV9,
    autoCorrectADV8,
    autoCorrectADV3,
    autoCorrectADV12,
    autoCorrectADV2
};
