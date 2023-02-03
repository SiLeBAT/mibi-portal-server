import { logger } from '../../../aspects';
import {
    CatalogRepository,
    Catalog,
    createCatalog,
    CatalogData,
    ADVCatalogEntry,
    ADV9CatalogEntry,
    ZSPCatalogEntry
} from '../../../app/ports';
import { loadCSVFile } from '../data-store/file/file-loader';
import _ from 'lodash';
import { CSVConfig } from '../model/file-loader.model';

interface CatalogConfig<T extends string, R> {
    id: string;
    uId?: string;
    csvSources: ({ fileName: string } & CSVConfig<T, R>)[];
}
interface ZSPColumnReadOptions {
    header: string;
    catalogName: string;
    kodeLength: number;
}

type GenCatalogConfig = CatalogConfig<string, CatalogData>;

type ADVHeader = keyof ADVCatalogEntry;
type TextHeader = 'Text1' | 'Text2' | 'Text3' | 'Text4' | 'Text5';

const advHeaders: { [header in ADVHeader]: number } = {
    Kodiersystem: 1,
    Kode: 2,
    Text: 6
};

const textHeaders: { [header in TextHeader]: number } = {
    Text1: 7,
    Text2: 8,
    Text3: 9,
    Text4: 10,
    Text5: 11
};

class FileCatalogRepository implements CatalogRepository {
    private catalogs: {
        [key: string]: Catalog<CatalogData>;
    };
    constructor(private dataDir: string) {
        this.catalogs = {};
    }

    async initialise(): Promise<void> {
        logger.verbose(
            `${this.constructor.name}.${this.initialise.name}, loading Catalog data from Filesystem.`
        );

        const advCatalogsConfig: GenCatalogConfig[] = [];
        const zspCatalogsConfig: GenCatalogConfig[] = [];

        const adv2Config: CatalogConfig<
            ADVHeader | TextHeader,
            ADVCatalogEntry
        > = {
            id: 'adv2',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV2.csv',
                    delimiter: '#',
                    headers: { ...advHeaders, ...textHeaders },
                    mappingFunction: e => ({
                        Kode: e.Kode,
                        Kodiersystem: e.Kodiersystem,
                        Text: e.Text.concat(
                            e.Text1,
                            e.Text2,
                            e.Text3,
                            e.Text4,
                            e.Text5
                        )
                    })
                }
            ]
        };
        advCatalogsConfig.push(adv2Config);

        const adv3Config: CatalogConfig<
            ADVHeader | TextHeader,
            ADVCatalogEntry
        > = {
            id: 'adv3',
            csvSources: [
                {
                    fileName: 'ADV3.csv',
                    delimiter: '#',
                    headers: { ...advHeaders, ...textHeaders },
                    mappingFunction: e => ({
                        Kode: e.Kode,
                        Kodiersystem: e.Kodiersystem.replace(/^0/, ''),
                        Text: e.Text.concat(
                            e.Text1,
                            e.Text2,
                            e.Text3,
                            e.Text4,
                            e.Text5
                        )
                    })
                }
            ]
        };
        advCatalogsConfig.push(adv3Config);

        const adv4Config: CatalogConfig<ADVHeader, ADVCatalogEntry> = {
            id: 'adv4',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV4.csv',
                    delimiter: '#',
                    headers: advHeaders,
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(adv4Config);

        const adv8Config: CatalogConfig<ADVHeader, ADVCatalogEntry> = {
            id: 'adv8',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV8.csv',
                    delimiter: '#',
                    headers: advHeaders,
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(adv8Config);

        const adv9Config: CatalogConfig<ADVHeader | 'PLZ', ADV9CatalogEntry> = {
            id: 'adv9',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV9.csv',
                    delimiter: '#',
                    headers: { ...advHeaders, PLZ: 8 },
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(adv9Config);

        const adv12Config: CatalogConfig<ADVHeader, ADVCatalogEntry> = {
            id: 'adv12',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV12.csv',
                    delimiter: '#',
                    headers: advHeaders,
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(adv12Config);

        const adv16Config: CatalogConfig<ADVHeader, ADVCatalogEntry> = {
            id: 'adv16',
            uId: 'Kode',
            csvSources: [
                {
                    fileName: 'ADV16.csv',
                    delimiter: '#',
                    headers: advHeaders,
                    mappingFunction: e => e,
                    filterFunction: e => {
                        const code = parseInt(e.Kode, 10);
                        return (
                            (code >= 302000 && code < 306000) ||
                            (code >= 500000 && code < 1700000) ||
                            (code >= 3402000 && code < 3402080) ||
                            (code >= 5500000 && code < 6000000)
                        );
                    }
                },
                {
                    fileName: 'ADV16_bfr.csv',
                    delimiter: '#',
                    headers: advHeaders,
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(adv16Config);

        const plzConfig: CatalogConfig<string, Record<string, string>> = {
            id: 'plz',
            uId: 'plz',
            csvSources: [
                {
                    fileName: 'PLZ.csv',
                    headers: true,
                    mappingFunction: e => e
                }
            ]
        };
        advCatalogsConfig.push(plzConfig);

        await Promise.all(
            advCatalogsConfig.map(config => this.addCatalog(config))
        );

        this.addZoMoCatalogs(zspCatalogsConfig);

        await Promise.all(
            zspCatalogsConfig.map(config => this.addCatalog(config))
        );

        logger.info(
            `${this.constructor.name}.${this.initialise.name}, finished initialising Catalog Repository from Filesystem.`
        );
    }

    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T> {
        return this.catalogs[catalogName] as Catalog<T>;
    }

    private async addCatalog(config: GenCatalogConfig): Promise<void> {
        const data = _.flatten(
            await Promise.all(
                config.csvSources.map(async source => {
                    try {
                        return await loadCSVFile(
                            source.fileName,
                            this.dataDir,
                            source
                        );
                    } catch (err) {
                        logger.warn(
                            `${this.constructor.name}.${this.initialise.name}, Catalog missing on Filesystem. catalog=${source.fileName}; error=${err}`
                        );
                        return [];
                    }
                })
            )
        );
        this.catalogs[config.id] = createCatalog(data, config.uId);
    }

    private addZoMoCatalogs(catalogsConfig: GenCatalogConfig[]): void {
        const currentYear = new Date().getFullYear();

        const names = [
            'zsp' + currentYear.toString(),
            'zsp' + (currentYear - 1).toString(),
            'zsp' + (currentYear + 1).toString()
        ];

        names.forEach(name => {
            catalogsConfig.push(this.createZoMoCatalogConfig(name));
        });


        const result: CatalogConfig<keyof ZSPCatalogEntry, ZSPCatalogEntry> = this.createZoMoCatalogConfig('zsp' + currentYear.toString());
        catalogsConfig.push(result);
    }

    private createZoMoCatalogConfig(
        name: string
    ): CatalogConfig<keyof ZSPCatalogEntry, ZSPCatalogEntry> {
        return {
            id: name,
            csvSources: [
                {
                    fileName: name.toUpperCase() + '.csv',
                    headers: true,
                    mappingFunction: e => {
                        const kodeResults: string[][] = [];

                        const zspOptions: ZSPColumnReadOptions[] = [{
                            header: 'ADV8-Kode',
                            catalogName: 'adv8',
                            kodeLength: 7
                        }, {
                            header: 'ADV3-Kode',
                            catalogName: 'adv3',
                            kodeLength: 6
                        }, {
                            header: 'ADV16-Kode',
                            catalogName: 'adv16',
                            kodeLength: 7
                        }, {
                            header: 'Kodiersystem',
                            catalogName: 'adv2',
                            kodeLength: 2
                        }];

                        zspOptions.forEach((option) => {
                            kodeResults.push(this.mapAdvKodes(e, option));
                        });

                        return {
                            'ADV8-Kode': kodeResults[0],
                            'ADV3-Kode': kodeResults[1],
                            'ADV16-Kode': kodeResults[2],
                            Kodiersystem: kodeResults[3]
                        }
                    }
                }
            ]
        };
    }

    private mapAdvKodes(entry: any, zspOptions: ZSPColumnReadOptions): string[] {
        const catalog: Catalog<CatalogData> = this.getCatalog(zspOptions.catalogName);
        const result: string[] = [];

        entry[zspOptions.header]
            .split(',')
            .forEach((value: string) => {
                value = value.trim();
                if (value.includes('-')) {
                    const startStopValues = value.split('-');
                    const rangeStart: number = _.parseInt(startStopValues[0].trim(), 10);
                    const rangeEnd: number = _.parseInt(startStopValues[1].trim(), 10);
                    const ranges: string[] = [...Array(rangeEnd - rangeStart + 1)
                        .keys()]
                        .map(x => (x + rangeStart).toString().padStart(zspOptions.kodeLength, '0'));
                    result.push(...ranges);

                } else {
                    result.push(value);
                }
            });

        const filteredResult: string[] = result.filter((kode: string) =>
            catalog.containsEntryWithKeyValue('Kode', kode)
        )

        const resultSorted: string[] = filteredResult.sort();

        return resultSorted;
    }
}

let repo: FileCatalogRepository;

export async function initialiseRepository(
    dataDir: string
): Promise<CatalogRepository> {
    const repository = repo ? repo : new FileCatalogRepository(dataDir);
    repo = repository;
    return repository.initialise().then(() => repository);
}
