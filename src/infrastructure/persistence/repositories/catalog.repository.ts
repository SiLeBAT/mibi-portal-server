import { logger } from '../../../aspects';
import {
    CatalogRepository,
    Catalog,
    createCatalog,
    CatalogData,
    CatalogConfig,
    ADVCatalogEntry,
    ADV9CatalogEntry
} from '../../../app/ports';
import { loadCSVFile } from '../data-store/file/file-loader';

class FileCatalogRepository implements CatalogRepository {
    private catalogs: {
        [key: string]: Catalog<CatalogData>;
    };
    constructor(private dataDir: string) {
        this.catalogs = {};
    }

    initialise() {
        logger.verbose(
            `${this.constructor.name}.${
                this.initialise.name
            }, loading Catalog data from Filesystem.`
        );

        const catalogsConfig: CatalogConfig[] = [
            {
                filename: 'ADV2.csv',
                id: 'adv2',
                uId: 'Kode',
                delimiter: '#',
                headers: false,
                mappingFunction: (e: string[]) => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6].concat(e[7], e[8], e[9], e[10], e[11])
                })
            },
            {
                filename: 'ADV3.csv',
                id: 'adv3',
                delimiter: '#',
                headers: false,
                mappingFunction: (e: string[]): ADVCatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1].replace(/^0/, ''),
                    Text: e[6].concat(e[7], e[8], e[9], e[10], e[11])
                })
            },
            {
                filename: 'ADV4.csv',
                id: 'adv4',
                uId: 'Kode',
                headers: false,
                delimiter: '#',
                mappingFunction: (e: string[]): ADVCatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6]
                })
            },
            {
                filename: 'ADV8.csv',
                id: 'adv8',
                uId: 'Kode',
                headers: false,
                delimiter: '#',
                mappingFunction: (e: string[]): ADVCatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6]
                })
            },
            {
                filename: 'ADV9.csv',
                id: 'adv9',
                uId: 'Kode',
                headers: false,
                delimiter: '#',
                mappingFunction: (e: string[]): ADV9CatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6],
                    PLZ: e[8]
                })
            },
            {
                filename: 'ADV12.csv',
                id: 'adv12',
                uId: 'Kode',
                headers: false,
                delimiter: '#',
                mappingFunction: (e: string[]): ADVCatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6]
                })
            },
            {
                filename: 'ADV16.csv',
                id: 'adv16',
                uId: 'Kode',
                headers: false,
                delimiter: '#',
                mappingFunction: (e: string[]): ADVCatalogEntry => ({
                    Kode: e[2],
                    Kodiersystem: e[1],
                    Text: e[6]
                }),
                filterFunction: (entry: string[]) => {
                    const code = parseInt(entry[2], 10);
                    return (
                        (code >= 302000 && code < 306000) ||
                        (code >= 500000 && code < 1700000) ||
                        (code >= 3402000 && code < 3402080) ||
                        (code >= 5500000 && code < 6000000)
                    );
                }
            },
            {
                filename: 'PLZ.csv',
                id: 'plz',
                uId: 'plz',
                headers: true
            }
        ];

        this.addZoMoDates(catalogsConfig);

        const promiseArray = catalogsConfig.map(catalogConfig => {
            return loadCSVFile<CatalogData>(catalogConfig, this.dataDir).then(
                (data: CatalogData[]) =>
                    (this.catalogs[catalogConfig.id] = createCatalog<
                        CatalogData
                    >(data, catalogConfig.uId)),
                (error: Error) => {
                    return new Promise((resolve, reject) => {
                        logger.warn(
                            `${this.constructor.name}.${
                                this.initialise.name
                            }, Catalog missing on Filesystem. catalog=${
                                catalogConfig.filename
                            }; error=${error}`
                        );
                        this.catalogs[catalogConfig.id] = createCatalog<
                            CatalogData
                        >([], catalogConfig.uId);
                        resolve();
                    });
                }
            );
        });

        return Promise.all(promiseArray).then(() =>
            logger.info(
                `${this.constructor.name}.${
                    this.initialise.name
                }, finished initialising Catalog Repository from Filesystem.`
            )
        );
    }

    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T> {
        return this.catalogs[catalogName] as Catalog<T>;
    }

    private addZoMoDates(catalogsConfig: CatalogConfig[]): CatalogConfig[] {
        const currentYear = new Date().getFullYear();

        const currentName: string = 'zsp' + currentYear;
        const lastName: string = 'zsp' + (currentYear - 1);
        const futureName: string = 'zsp' + (currentYear + 1);

        catalogsConfig.push({
            filename: currentName.toUpperCase() + '.csv',
            id: currentName,
            headers: true
        });

        catalogsConfig.push({
            filename: lastName.toUpperCase() + '.csv',
            id: lastName,
            headers: true
        });

        catalogsConfig.push({
            filename: futureName.toUpperCase() + '.csv',
            id: futureName,
            headers: true
        });

        return catalogsConfig;
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
