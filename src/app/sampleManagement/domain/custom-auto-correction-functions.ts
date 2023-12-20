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
    FuzzyEintrag,
    AVV324Data,
    AVVCatalogData,
    AVVCatalog
} from '../model/catalog.model';

function autoCorrectTiereMatrixText(catalogService: CatalogService): CorrectionFunction {
    const catalogNameTiere = 'avv339';
    const catalogNameMatrix = 'avv319';
    const propertyTierMatrixText: SampleProperty = 'animal_matrix_text';
    const propertyTierAVV: SampleProperty = 'animal_avv';
    const propertyMatrixAVV: SampleProperty = 'matrix_avv';
    const catalogTiere = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameTiere);
    const catalogMatrix = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameMatrix);

    const separator = '. ';
    const userPrefix = 'User';
    const tierPrefix = 'Tier';
    const matrixPrefix = 'Matrix';

    logger.debug(
        'Initializing auto-correction: Tiere/Matrix Text & creating closure'
    );

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[propertyTierMatrixText].value;
        const trimmedEntry = originalValue.trim();

        // ignore already autocorrected or empty entries
        if (trimmedEntry.includes(`${userPrefix}: `) ||
            trimmedEntry.includes(`${tierPrefix}: `) ||
            trimmedEntry.includes(`${matrixPrefix}: `) ||
            (sampleData[propertyTierAVV].value === '' &&
                sampleData[propertyMatrixAVV].value === '' &&
                originalValue === ''))  {


            return null;
        }

        const generatedText = generateTextFromTwoCodes(
            sampleData,
            propertyTierAVV,
            propertyMatrixAVV,
            trimmedEntry,
            catalogTiere,
            catalogMatrix,
            userPrefix,
            tierPrefix,
            matrixPrefix,
            separator
        );

        if (generatedText === '') {
            return null;
        }

        return {
            field: propertyTierMatrixText,
            original: '',
            correctionOffer: [generatedText],
            code: 103
        };
    };
}

function autoCorrectKontrollprogrammUntersuchungsgrundText(catalogService: CatalogService): CorrectionFunction {
    const catalogNameKontrollprogramm = 'avv322';
    const catalogNameUntersuchungsgrund = 'avv326';
    const propertyProgrammGrundText: SampleProperty = 'program_reason_text';
    const propertyKontrollprogrammAVV: SampleProperty = 'control_program_avv';
    const propertyUntersuchungsgrundAVV: SampleProperty = 'sampling_reason_avv';
    const catalogKontrollprogramm = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameKontrollprogramm);
    const catalogUntersuchungsgrund = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameUntersuchungsgrund);

    const separator = '. ';
    const userPrefix = 'User';
    const kontrollprogrammPrefix = 'Kontroll-P';
    const untersuchungsgrundPrefix = 'Unters.-Grund';

    logger.debug(
        'Initializing auto-correction: Kontrollprogramm/Untersuchungsgrund Text & creating closure'
    );

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[propertyProgrammGrundText].value;
        const trimmedEntry = originalValue.trim();

        // ignore already autocorrected or empty entries
        if (trimmedEntry.includes(`${userPrefix}: `) ||
            trimmedEntry.includes(`${kontrollprogrammPrefix}: `) ||
            trimmedEntry.includes(`${untersuchungsgrundPrefix}: `) ||
            (sampleData[propertyKontrollprogrammAVV].value === '' &&
                sampleData[propertyUntersuchungsgrundAVV].value === '' &&
                originalValue === ''))  {

            return null;
        }
        const generatedText = generateTextFromTwoCodes(
            sampleData,
            propertyKontrollprogrammAVV,
            propertyUntersuchungsgrundAVV,
            trimmedEntry,
            catalogKontrollprogramm,
            catalogUntersuchungsgrund,
            userPrefix,
            kontrollprogrammPrefix,
            untersuchungsgrundPrefix,
            separator
        );

        if (generatedText === '') {
            return null;
        }

        return {
            field: propertyProgrammGrundText,
            original: '',
            correctionOffer: [generatedText],
            code: 107
        };
    };
}

function generateTextFromTwoCodes(
    sampleData: SampleData,
    sampleCodeProperty1: SampleProperty,
    sampleCodeProperty2: SampleProperty,
    trimmedEntry: string,
    avvCatalog1: AVVCatalog<AVVCatalogData>,
    avvCatalog2: AVVCatalog<AVVCatalogData>,
    userPrefix: string,
    prefix1: string,
    prefix2: string,
    separator: string
): string {
    let generatedText = '';
    const codeValue1 = sampleData[sampleCodeProperty1].value.trim();
    const codeValue2 = sampleData[sampleCodeProperty2].value.trim();
    let catalogTextValue1 = avvCatalog1.getTextWithAVVKode(codeValue1.trim());
    let catalogTextValue2 = avvCatalog2.getTextWithAVVKode(codeValue2.trim());

    const cleanedUserText = trimmedEntry
        .replace(catalogTextValue1, '')
        .trim()
        .replace(catalogTextValue2, '')
        .trim()
        .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
    const userTextLength = cleanedUserText.length;
    const textValueLength = trimmedEntry.length;
    const catalogTextLength = trimmedEntry.length - userTextLength;
    const hasUserText = (textValueLength > catalogTextLength);

    const hasCode1 = !!codeValue1;
    const hasCode2 = !!codeValue2;
    const hasText = !!trimmedEntry;
    const isCatalogText1 = (catalogTextValue1 !== '') && trimmedEntry === catalogTextValue1;
    const isCatalogText2 = (catalogTextValue2 !== '') && trimmedEntry === catalogTextValue2;
    const hasCatalogText1 = (catalogTextValue1 !== '') && trimmedEntry.includes(catalogTextValue1);
    const hasCatalogText2 = (catalogTextValue2 !== '') && trimmedEntry.includes(catalogTextValue2);
    const isUserText = !hasCatalogText1 && !hasCatalogText2 && hasText;
    const hasUserAndCatalogText1 = hasCatalogText1 && !hasCatalogText2 && hasUserText;
    const hasUserAndCatalogText2 = hasCatalogText2 && !hasCatalogText1 && hasUserText;
    const hasUserAndCatalogText1AndCatalogText2 = hasCatalogText1 && hasCatalogText2 && hasUserText;

    if (!hasCode1 && !hasCode2 && !hasText) {
        return '';
    }

    if (!hasCode1 && !hasCode2 && hasText) {
        return `${userPrefix}: ${trimmedEntry}`;
    }

    if (hasCode1 && !hasCode2 && !hasText) {
        return `${prefix1}: ${catalogTextValue1}`;
    }

    if (hasCode1 && !hasCode2 && isUserText) {
        return `${userPrefix}: ${trimmedEntry}${separator}${prefix1}: ${catalogTextValue1}`;
    }

    if (hasCode1 && !hasCode2 && isCatalogText1) {
        return `${prefix1}: ${catalogTextValue1}`;
    }

    if (hasCode1 && !hasCode2 && hasUserAndCatalogText1) {
        const userText = cleanedUserText;
        return `${userPrefix}: ${userText}${separator}${prefix1}: ${catalogTextValue1}`;
    }

    if (!hasCode1 && hasCode2 && !hasText) {
        return `${prefix2}: ${catalogTextValue2}`;
    }

    if (!hasCode1 && hasCode2 && isUserText) {
        return `${userPrefix}: ${trimmedEntry}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    if (!hasCode1 && hasCode2 && isCatalogText2) {
        return `${prefix2}: ${catalogTextValue2}`;
    }

    if (!hasCode1 && hasCode2 && hasUserAndCatalogText2) {
        const userText = cleanedUserText;
        return `${userPrefix}: ${userText}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    if (hasCode1 && hasCode2 && !hasText) {
        return `${prefix1}: ${catalogTextValue1}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    if (hasCode1 && hasCode2 && isUserText) {
        return `${userPrefix}: ${trimmedEntry}${separator}${prefix1}: ${catalogTextValue1}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    if (
        hasCode1 &&
        hasCode2 &&
        (hasCatalogText1 || hasCatalogText2) &&
        !hasUserAndCatalogText1 &&
        !hasUserAndCatalogText2 &&
        !hasUserAndCatalogText1AndCatalogText2
    ) {
        return `${prefix1}: ${catalogTextValue1}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    if (
        hasCode1 &&
        hasCode2 &&
        (hasUserAndCatalogText1 || hasUserAndCatalogText2 || hasUserAndCatalogText1AndCatalogText2)
    ) {
        const userText = cleanedUserText;
        return `${userPrefix}: ${userText}${separator}${prefix1}: ${catalogTextValue1}${separator}${prefix2}: ${catalogTextValue2}`;
    }

    return generatedText;
}

function autoCorrectOrtText(catalogService: CatalogService): CorrectionFunction {
    const catalogNameOrt = 'avv313';
    const propertyOrtText: SampleProperty = 'sampling_location_text';
    const propertyOrtAVV: SampleProperty = 'sampling_location_avv';
    const catalogOrt = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameOrt);

    const separator = '. ';
    const userPrefix = 'User';
    const ortPrefix = 'Ort';

    logger.debug(
        'Initializing auto-correction: Ort Text & creating closure'
    );

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[propertyOrtText].value;
        const trimmedEntry = originalValue.trim();

        // ignore already autocorrected or empty entries
        if (trimmedEntry.includes(`${userPrefix}: `) ||
            trimmedEntry.includes(`${ortPrefix}: `) ||
            (sampleData[propertyOrtAVV].value === '' &&
                originalValue === ''))  {

            return null;
        }
        const generatedText = generateTextFromCode(
            sampleData,
            propertyOrtAVV,
            trimmedEntry,
            catalogOrt,
            userPrefix,
            ortPrefix,
            separator
        );

        if (generatedText === '') {
            return null;
        }

        return {
            field: propertyOrtText,
            original: '',
            correctionOffer: [generatedText],
            code: 106
        };
    };
}

function autoCorrectBetriebsartText(catalogService: CatalogService): CorrectionFunction {
    const catalogNameBetriebsart = 'avv303';
    const propertyBetriebsartText: SampleProperty = 'operations_mode_text';
    const propertyBetriebsartAVV: SampleProperty = 'operations_mode_avv';
    const catalogBetriebsart = catalogService.getAVVCatalog<AVVCatalogData>(catalogNameBetriebsart);

    const separator = '. ';
    const userPrefix = 'User';
    const betriebsPrefix = 'Betrieb';

    logger.debug(
        'Initializing auto-correction: Betriebsart Text & creating closure'
    );

    return (sampleData: SampleData): CorrectionSuggestions | null => {
        const originalValue = sampleData[propertyBetriebsartText].value;
        const trimmedEntry = originalValue.trim();

        // ignore already autocorrected or empty entries
        if (trimmedEntry.includes(`${userPrefix}: `) ||
            trimmedEntry.includes(`${betriebsPrefix}: `) ||
            (sampleData[propertyBetriebsartAVV].value === '' &&
                originalValue === ''))  {

            return null;
        }
        const generatedText = generateTextFromCode(
            sampleData,
            propertyBetriebsartAVV,
            trimmedEntry,
            catalogBetriebsart,
            userPrefix,
            betriebsPrefix,
            separator
        );

        if (generatedText === '') {
            return null;
        }

        return {
            field: propertyBetriebsartText,
            original: '',
            correctionOffer: [generatedText],
            code: 108
        };
    };
}

function generateTextFromCode(
    sampleData: SampleData,
    sampleCodeProperty: SampleProperty,
    trimmedEntry: string,
    avvCatalog: AVVCatalog<AVVCatalogData>,
    userPrefix: string,
    prefix: string,
    separator: string
): string {

    let generatedText = '';
    const codeValue = sampleData[sampleCodeProperty].value.trim();
    let catalogTextValue = avvCatalog.getTextWithAVVKode(codeValue.trim());

    const hasCode = !!codeValue;
    const hasText = !!trimmedEntry;
    const isCatalogText = trimmedEntry === catalogTextValue;
    const hasCatalogText = trimmedEntry.includes(catalogTextValue);
    const isUserText = !hasCatalogText && hasText;
    const hasUserAndCatalogText = hasCatalogText && (trimmedEntry.length > catalogTextValue.length);

    if (!hasCode && !hasText) {
        return '';
    }

    if (hasCode && !hasText) {
        return `${catalogTextValue}`;
    }

    if (!hasCode && hasText) {
        return '';
    }

    if (hasCode && isUserText) {
        return `${userPrefix}: ${trimmedEntry}${separator}${prefix}: ${catalogTextValue}`;
    }

    if (hasCode && isCatalogText) {
        return '';
    }

    if (hasCode && hasUserAndCatalogText) {
        const userText = trimmedEntry.replace(catalogTextValue, '').trim();
        return `${userPrefix}: ${userText}${separator}${prefix}: ${catalogTextValue}`;
    }

    return generatedText;
}



function autoCorrectAVV324(catalogService: CatalogService): CorrectionFunction {
    const catalogName = 'avv324';
    const property: SampleProperty = 'pathogen_avv';
    const catalog = catalogService.getAVVCatalog<AVV324Data>(catalogName);
    logger.debug(
        'Initializing auto-correction: Pathogen (AVV-324) & creating closure'
    );
    const options = getFuseOptions();

    const catalogEnhancements = createCatalogEnhancements(
        catalogService,
        catalogName
    ) as CatalogEnhancement[];

    const fuse = catalogService
        .getAVVCatalog<AVV324Data>(catalogName)
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

        if (catalog.containsTextEintrag(trimmedEntry)) {
            return null;
        }

        // Check AVV codes
        const avvKode = /^\d+\|\d+\|$/;
        if (avvKode.test(trimmedEntry) && catalog.containsEintragWithAVVKode(trimmedEntry)) {
            const eintrag = catalog.getEintragWithAVVKode(trimmedEntry);
            if (eintrag) {
                searchCache[trimmedEntry] = createCacheEntry(
                    property,
                    originalValue,
                    [eintrag.Text],
                    88
                );
                return searchCache[trimmedEntry];
            }
        }

        // Search for Genus
        const genusEntry = 'Genus ' + trimmedEntry;
        if (catalog.containsTextEintrag(genusEntry)) {
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

function doFuzzySearch(
    value: string,
    fuse: Fuse<ADVCatalogEntry | FuzzyEintrag>,
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

function getFuseOptions(): Fuse.IFuseOptions<FuzzyEintrag> {
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
    autoCorrectTiereMatrixText,
    autoCorrectKontrollprogrammUntersuchungsgrundText,
    autoCorrectOrtText,
    autoCorrectBetriebsartText,
    autoCorrectAVV324
};
