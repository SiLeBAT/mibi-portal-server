import {
    Catalog,
    CatalogData,
    CatalogRepository,
    createCatalog,
} from '../../../app/ports';
import { logger } from '../../../aspects';
import {
    loadJSONFile
} from '../data-store/file/file-loader';

class FileCatalogRepository implements CatalogRepository {
    private catalogs: {
        [key: string]: Catalog<CatalogData>;
    };
    private catalogNames: string[] = [
        'adv2',
        'adv3',
        'adv4',
        'adv8',
        'adv9',
        'adv12',
        'adv16',
        'plz',
        `zsp${new Date().getFullYear().toString()}`,
        `zsp${(new Date().getFullYear() + 1).toString()}`,
        `zsp${(new Date().getFullYear() - 1).toString()}`
    ];

    constructor(private dataDir: string) {
        this.catalogs = {};
    }

    async initialise(): Promise<void> {
        logger.verbose(
            `${this.constructor.name}.${this.initialise.name}, loading Catalog data from Filesystem.`
        );

        await Promise.all(
            this.catalogNames.map(async catalogName => {
                return loadJSONFile(`${catalogName}.json`, this.dataDir)
                    .then(
                        // tslint:disable-next-line:no-any
                        (jsonData: {
                            data: CatalogData[],
                            uId: string
                        }) => {
                            this.catalogs[catalogName] = createCatalog(jsonData.data, jsonData.uId);
                            return;
                        }
                    )
                    .catch(error => {
                        logger.warn(`Error loading catalog from json file: ${error}`);
                    });
            }))
            .then(() => {
                logger.info(
                    `${this.constructor.name}.${this.initialise.name}, finished initialising Catalog Repository from Filesystem.`
                );

            });
    }

    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T> {
        return this.catalogs[catalogName] as Catalog<T>;
    }
}

let repo: FileCatalogRepository;

export async function getRepository(
    dataDir: string
): Promise<CatalogRepository> {
    if (repo) {
        return repo;
    }

    repo = new FileCatalogRepository(dataDir);

    return repo.initialise().then(() => repo);
}
