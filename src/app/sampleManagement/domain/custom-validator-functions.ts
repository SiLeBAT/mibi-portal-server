import { AVVCatalog, AVVCatalogData, MibiCatalogData, MibiCatalogFacettenData, ZSPCatalogEntry } from './../model/catalog.model';
import moment from 'moment';
import _ from 'lodash';
import {
    RequiredIfOtherOptions,
    MatchRegexPatternOptions,
    MatchIdToYearOptions,
    ValidatorFunction,
    InCatalogOptions,
    MatchADVNumberOrStringOptions,
    MatchAVVCodeOrStringOptions,
    RegisteredZoMoOptions,
    AtLeastOneOfOptions,
    DependentFieldsOptions,
    ReferenceDateOptions,
    ValidatorFunctionOptions
} from '../model/validation.model';
import { CatalogService } from '../model/catalog.model';
import { SampleProperty, SampleDataValues } from '../model/sample.model';
import { MalformedValidationOptionsError } from './domain.error';
import { NRL_ID } from './enums';

moment.locale('de');

function nrlExists(
    value: string,
    options: ValidatorFunctionOptions,
    key: SampleProperty,
    attributes: Record<string, string>
) {
    if (attributes.nrl === NRL_ID.UNKNOWN) {
        return { ...options.message };
    }
    return null;
}

function noPlanprobeForNRL_AR(
    value: string,
    options: ValidatorFunctionOptions,
    key: SampleProperty,
    attributes: Record<string, string>
) {
    const disallowed = ['22562|126354|', 'Planprobe'];
    return attributes.nrl === NRL_ID.NRL_AR && _.includes(disallowed, value)
        ? { ...options.message }
        : null;
}

function requiredIfOther(
    value: string,
    options: RequiredIfOtherOptions,
    key: SampleProperty,
    attributes: Record<string, string>
) {
    const re = new RegExp(options.regex);
    const matchResult = re.test(attributes[options.field].toString());
    if (matchResult && isEmptyString(attributes[key])) {
        return { ...options.message };
    }
    return null;
}

function numbersOnlyValue(value: string): boolean {
    const numbersOnly = /^\d+$/;
    return numbersOnly.test(value);
}

// @ts-ignore
function isAVVKodeValue(value: string): boolean {
    const avvKode = /^\d+\|\d+\|$/;
    return avvKode.test(value);
}

function matchesRegexPattern(
    value: string,
    options: MatchRegexPatternOptions,
    key: SampleProperty,
    attributes: SampleDataValues
) {
    if (!value || !options.regex.length) {
        return null;
    }
    if (options.ignoreNumbers && numbersOnlyValue(value)) {
        return null;
    }
    let success = false;
    const regexpAry = options.regex.map(str => {
        return new RegExp(str, options.caseInsensitive ? 'i' : undefined);
    });
    regexpAry.forEach(regexp => {
        if (regexp.test(value)) {
            success = true;
        }
    });
    return success ? null : { ...options.message };
}

function matchesIdToSpecificYear(
    value: string,
    options: MatchIdToYearOptions,
    key: SampleProperty,
    attributes: SampleDataValues
) {
    if (!value) {
        return null;
    }
    let currentYear = moment();
    let nextYear = moment().add(1, 'year');
    let lastYear = moment().subtract(1, 'year');
    if (attributes['sampling_date']) {
        currentYear = moment(attributes['sampling_date'], 'DD.MM.YYYY');
        nextYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').add(
            1,
            'year'
        );
        lastYear = moment(attributes['sampling_date'], 'DD.MM.YYYY').subtract(
            1,
            'year'
        );
    }

    const changedArray = _.flatMap(options.regex, (entry: string) => {
        const result: string[] = [];
        if (entry.includes('yyyy')) {
            const currentEntry = entry.replace(
                'yyyy',
                currentYear.format('YYYY')
            );
            const nextEntry = entry.replace('yyyy', nextYear.format('YYYY'));
            const lastEntry = entry.replace('yyyy', lastYear.format('YYYY'));
            result.push(lastEntry);
            result.push(currentEntry);
            result.push(nextEntry);
        } else if (entry.includes('yy')) {
            const currentEntry = entry.replace('yy', currentYear.format('YY'));
            const nextEntry = entry.replace('yy', nextYear.format('YY'));
            const lastEntry = entry.replace('yy', lastYear.format('YY'));
            result.push(lastEntry);
            result.push(currentEntry);
            result.push(nextEntry);
        } else {
            result.push(entry);
        }
        return result;
    });
    options.regex = changedArray;
    return matchesRegexPattern(
        value,
        { ...options, ...{ ignoreNumbers: false } },
        key,
        attributes
    );
}

function inCatalog(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: InCatalogOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        const trimmedValue = value.trim();
        if (attributes[key]) {
            const catalogs = options.catalog.split(',');

            const catalogWithKode = _.filter(catalogs, (catalog) => {
                const cat = catalogService.getCatalog(catalog);

                if (cat) {
                    const key: string = options.key
                        ? options.key
                        : cat.getUniqueId();
                    return (key && cat.containsEntryWithKeyValue(key, trimmedValue));
                }
            });

            if (catalogWithKode.length === 0) {
                return { ...options.message };
            }
        }
        return null;
    };
}

function inAVVCatalog(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: InCatalogOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        const trimmedValue = value.trim();
        if (attributes[key]) {
            const catalogs = options.catalog.split(',');

            const catalogWithKode = _.filter(catalogs, (catalog) => {
                const cat = catalogService.getAVVCatalog<AVVCatalogData>(catalog);

                if (cat) {
                    return (cat.containsEintragWithAVVKode(trimmedValue) ||
                            cat.containsTextEintrag(trimmedValue));
                }
            });

            if (catalogWithKode.length === 0) {
                return { ...options.message };
            }
        }
        return null;
    };
}

function inAVVFacettenCatalog(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: InCatalogOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        const trimmedValue = value.trim();
        if (attributes[key]) {

            const [begriffsIdEintrag, id, facettenValues, currentAttributes] = trimmedValue.split('|');
            const catalogName = options.catalog;
            const catalog = catalogService.getAVVCatalog<MibiCatalogFacettenData>(catalogName);
            if (catalog) {
                if (!(begriffsIdEintrag && id)) {
                    return { ...options.message };
                }

                const avvKode = catalog.assembleAVVKode(begriffsIdEintrag, id);
                let found = catalog.containsEintragWithAVVKode(avvKode);
                found = found && checkEintragAttributes(currentAttributes, avvKode, catalog);

                const facettenIds = catalog.getFacettenIdsWithKode(avvKode);
                if (facettenIds && facettenValues) {
                    const currentFacetten = facettenValues.split(',');
                    found = found && currentFacetten.every((facettenValue) => {
                        const [facettenBeginnId, facettenEndeIds] = facettenValue.split('-');
                        const facettenEndeIdList = facettenEndeIds.split(':');
                        const facette = catalog.getFacetteWithBegriffsId(facettenBeginnId);
                        let facettenWertPresent: boolean = false;
                        if (facette && facettenIds.includes(facette.FacettenId)) {
                            facettenWertPresent = facettenEndeIdList.every((facettenEndeId) => {
                                const facettenWert = catalog.getFacettenWertWithBegriffsId(facettenEndeId, facettenBeginnId);
                                return !!facettenWert;
                            });
                        }
                        return facettenWertPresent;
                    });
                }
                if (!found) {
                    return { ...options.message };
                }
            }
        }

        return null;
    };
}

function checkEintragAttributes<T extends MibiCatalogData | MibiCatalogFacettenData>(
    currentAttributes: string,
    avvKode: string,
    catalog: AVVCatalog<T>
) {
    if (currentAttributes) {
        const eintragAttributes = catalog.getAttributeWithAVVKode(avvKode);
        if (eintragAttributes) {
            return currentAttributes
                .split(':')
                .every((attr) => eintragAttributes.includes(attr));
        }
    }

    return true;
}

// Matching for ADV16 according to #mps53
function matchADVNumberOrString(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: MatchADVNumberOrStringOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        const trimmedValue = value.trim();
        const altKeys = options.alternateKeys || [];
        if (attributes[key]) {
            const cat = catalogService.getCatalog(options.catalog);

            if (cat) {
                const key: string = options.key
                    ? options.key
                    : cat.getUniqueId();
                if (!key) {
                    return null;
                }
                if (numbersOnlyValue(value)) {
                    if (!cat.containsEntryWithKeyValue(key, trimmedValue)) {
                        return { ...options.message };
                    }
                } else {
                    let found = false;
                    altKeys.forEach(k => {
                        found =
                            cat.containsEntryWithKeyValue(k, trimmedValue) ||
                            found;
                    });
                    if (found) {
                        return null;
                    }
                    return { ...options.message };
                }
            }
        }
        return null;
    };
}

function matchAVVCodeOrString(
    catalogService: CatalogService
): ValidatorFunction<InCatalogOptions> {
    return (
        value: string,
        options: MatchAVVCodeOrStringOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        const trimmedValue = value.trim();
        const altKey = options.alternateKey || '';
        if (attributes[key]) {
            const cat = catalogService.getAVVCatalog<AVVCatalogData>(options.catalog)

            if (cat) {
                const key: string = options.key
                    ? options.key
                    : cat.getUniqueId();
                if (!key) {
                    return null;
                }
                if (isAVVKodeValue(trimmedValue)) {
                    if (!cat.containsEintragWithAVVKode(trimmedValue)) {
                        return { ...options.message };
                    }
                }
                if (altKey === 'Text') {
                    if (!cat.containsTextEintrag(trimmedValue)) {
                        return { ...options.message };
                    }

                    return null;
                }

                return { ...options.message };
            }
        }
        return null;
    };
}

function shouldBeZoMo(
    catalogService: CatalogService
): ValidatorFunction<RegisteredZoMoOptions> {
    return (
        value: string,
        options: RegisteredZoMoOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        if (attributes.nrl === NRL_ID.UNKNOWN) {
            return null;
        }

        const years = getYears(options.year, attributes);
        const advCat = catalogService.getCatalog<ZSPCatalogEntry>(options.catalog);

        let result = null;
        _.forEach(years, yearToCheck => {
            const zspCat = catalogService.getCatalog<ZSPCatalogEntry>(
                'zsp' + yearToCheck.toString()
            );
            if (zspCat && advCat) {
                const groupValues = options.group.map(g => attributes[g.attr]);

                // tslint:disable-next-line: no-any
                const adv16Entry: any[] = advCat.getEntriesWithKeyValue('Text', groupValues[3]);
                if (adv16Entry.length < 1) {
                    return null;
                }
                let adv16Kode: string = adv16Entry[0]['Kode'];

                // tslint:disable-next-line
                const zspEntries: any[] = zspCat.dump() as any[];
                // tslint:disable-next-line: no-any
                const zspEntriesWithValues = _.filter(zspEntries, (entry: any) => {
                    const containsKodes = (
                        containsEntryWithValueFast(entry[options.group[0].code], groupValues[0]) &&
                        containsEntryWithValueFast(entry[options.group[1].code], groupValues[1]) &&
                        containsEntryWithValueFast(entry[options.group[2].code], groupValues[2]) &&
                        containsEntryWithValueFast(entry[options.group[3].code], adv16Kode)
                    );

                    return containsKodes;
                });

                if (zspEntriesWithValues.length >= 1) {
                    result = { ...options.message };
                }
            }
        });
        return result;
    };
}

function registeredZoMo(
    catalogService: CatalogService
): ValidatorFunction<RegisteredZoMoOptions> {
    return (
        value: string,
        options: RegisteredZoMoOptions,
        key: SampleProperty,
        attributes: SampleDataValues
    ) => {
        if (attributes.nrl === NRL_ID.UNKNOWN) {
            return { ...options.message };
        }

        const years = getYears(options.year, attributes);

        if (years.length > 0) {
            const yearToCheck = Math.min(...years);
            const zspCat = catalogService.getCatalog<ZSPCatalogEntry>(
                'zsp' + yearToCheck.toString()
            );
            const advCat = catalogService.getCatalog<ZSPCatalogEntry>(options.catalog);
            if (zspCat && advCat) {
                const groupValues = options.group.map(g => attributes[g.attr]);

                // tslint:disable-next-line: no-any
                const adv16Entry: any[] = advCat.getEntriesWithKeyValue('Text', groupValues[3]);
                if (adv16Entry.length < 1) {
                    return { ...options.message };
                }
                let adv16Kode: string = adv16Entry[0]['Kode'];

                // tslint:disable-next-line: no-any
                const zspEntries: any[] = zspCat.dump() as any[];
                // tslint:disable-next-line: no-any
                const zspEntriesWithValues = _.filter(zspEntries, (entry: any) => {
                    const containsKodes = (
                        containsEntryWithValueFast(entry[options.group[0].code], groupValues[0]) &&
                        containsEntryWithValueFast(entry[options.group[1].code], groupValues[1]) &&
                        containsEntryWithValueFast(entry[options.group[2].code], groupValues[2]) &&
                        containsEntryWithValueFast(entry[options.group[3].code], adv16Kode)
                    );

                    return containsKodes;
                });

                if (zspEntriesWithValues.length < 1) {
                    return { ...options.message };
                }
            } else {
                return { ...options.message };
            }
        } else {
            return { ...options.message };
        }
        return null;
    };
}

function containsEntryWithValueFast (arr: string[], value: string) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);
        if (arr[middle] === value) {
            return true;
            // tslint:disable-next-line
        } else if (arr[middle] < value) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }
    return false;
}

function getYears(ary: string[], attributes: SampleDataValues): number[] {
    const tmp = ary.map((y: SampleProperty) => {
        const yearValue = attributes[y];
        const formattedYear = moment
            .utc(yearValue, 'DD-MM-YYYY')
            .format('YYYY');
        return parseInt(formattedYear, 10);
    });

    return Array.from(new Set(tmp));
}

function atLeastOneOf(
    value: string,
    options: AtLeastOneOfOptions,
    key: SampleProperty,
    attributes: SampleDataValues
) {
    if (isEmptyString(attributes[key])) {
        for (let i = 0; i < options.additionalMembers.length; i++) {
            const element = options.additionalMembers[i];
            if (!isEmptyString(attributes[element])) {
                return null;
            }
        }
        return { ...options.message };
    }
    return null;
}
function dateAllowEmpty(
    value: string,
    options: AtLeastOneOfOptions,
    key: SampleProperty,
    attributes: SampleDataValues
) {
    if (isEmptyString(value)) {
        return null;
    } else if (
        moment
            .utc(
                value,
                ['DD.MM.YYYY', 'D.MM.YYYY', 'D.M.YYYY', 'DD.M.YYYY'],
                true
            )
            .isValid()
    ) {
        return null;
    } else {
        return { ...options.message };
    }
}

function dependentFields(
    value: string,
    options: DependentFieldsOptions,
    key: SampleProperty,
    attributes: SampleDataValues
) {
    if (attributes[key]) {
        for (let i = 0; i < options.dependents.length; i++) {
            const element = options.dependents[i];
            if (!attributes[element]) {
                return { ...options.message };
            }
        }
    }
    return null;
}

function referenceDate(
    value: string,
    options: ReferenceDateOptions,
    key: SampleProperty,
    // tslint:disable-next-line
    attributes: any
) {
    if (moment.utc(value, 'DD-MM-YYYY').isValid()) {
        let referenceDateId;
        let refereceOperation;
        let referenceDate;

        if (options.earliest) {
            referenceDateId = options.earliest;
            refereceOperation = dateIsSameOrBeforeReference;
        } else if (options.latest) {
            referenceDateId = options.latest;
            refereceOperation = dateIsSameOrAfterReference;
        } else {
            throw new MalformedValidationOptionsError(
                'Error occured trying to validate'
            );
        }

        if (attributes[referenceDateId]) {
            referenceDate = moment.utc(
                attributes[referenceDateId],
                'DD-MM-YYYY'
            );
        } else if (referenceDateId === 'NOW') {
            referenceDate = moment();
        } else {
            referenceDate = moment.utc(referenceDateId, 'DD-MM-YYYY');
        }

        if (options.earliest) {
            if (options.modifier) {
                referenceDate = referenceDate.subtract(
                    options.modifier.value,
                    options.modifier.unit
                );
            }
        } else if (options.latest) {
            if (options.modifier) {
                referenceDate = referenceDate.add(
                    options.modifier.value,
                    options.modifier.unit
                );
            }
        }

        if (
            !referenceDate.isValid() ||
            refereceOperation(moment.utc(value, 'DD-MM-YYYY'), referenceDate)
        ) {
            return null;
        } else {
            return { ...options.message };
        }
    }
    return null;
}

function dateIsSameOrAfterReference(
    date: moment.Moment,
    referenceDate: moment.Moment
) {
    return referenceDate.isSameOrAfter(date, 'day');
}

function dateIsSameOrBeforeReference(
    date: moment.Moment,
    referenceDate: moment.Moment
) {
    return referenceDate.isSameOrBefore(date, 'day');
}

function isEmptyString(str: string): boolean {
    return !('' + str).trim();
}

export {
    referenceDate,
    atLeastOneOf,
    dateAllowEmpty,
    dependentFields,
    requiredIfOther,
    inCatalog,
    inAVVCatalog,
    inAVVFacettenCatalog,
    registeredZoMo,
    shouldBeZoMo,
    matchADVNumberOrString,
    matchAVVCodeOrString,
    matchesRegexPattern,
    matchesIdToSpecificYear,
    nrlExists,
    noPlanprobeForNRL_AR
};
