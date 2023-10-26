import { logger } from '../../../aspects';
import {
    AVVCatalogRepository,
    AVVCatalog,
    createAVVCatalog,
    AVVCatalogData,
    MibiCatalogData,
    MibiCatalogFacettenData
} from '../../../app/ports';
import {
    loadJSONFile
} from '../data-store/file/file-loader';
import _ from 'lodash';

class AVVFileCatalogRepository implements AVVCatalogRepository {
    private catalogs: {
        [key: string]: AVVCatalog<AVVCatalogData>;
    };
    private catalogNames: string[] = [
        'avv303',
        'avv313',
        'avv316',
        'avv319',
        'avv322',
        'avv324',
        'avv326',
        'avv339',
        // `zsp${new Date().getFullYear().toString()}`,
        // `zsp${(new Date().getFullYear() + 1).toString()}`,
        // `zsp${(new Date().getFullYear() - 1).toString()}`
    ];

    constructor(private dataDir: string) {
        this.catalogs = {};
    }

    async initialise(): Promise<void> {
        logger.verbose(
            `${this.constructor.name}.${this.initialise.name}, loading AVV Catalog data from Filesystem.`
        );

        await Promise.all(
            this.catalogNames.map(async catalogName => {
                return loadJSONFile(`${catalogName}.json`, this.dataDir)
                    .then(
                        // tslint:disable-next-line:no-any
                        (jsonData: {
                            data: MibiCatalogData | MibiCatalogFacettenData,
                            uId: string
                        }) => {
                            this.catalogs[catalogName] = createAVVCatalog(jsonData.data, jsonData.uId);
                            return;
                        }
                    )
                    .catch(error => {
                        logger.warn(`Error loading AVV catalog from json file: ${error}`);
                    });
            }))
            .then(() => {
                logger.info(
                    `${this.constructor.name}.${this.initialise.name}, finished initialising AVV Catalog Repository from Filesystem.`
                );

            });
    }

    getAVVCatalog<T extends AVVCatalogData>(catalogName: string): AVVCatalog<T> {
        return this.catalogs[catalogName] as AVVCatalog<T>;
    }
}

let repo: AVVFileCatalogRepository;

export async function initialiseRepository(
    dataDir: string
): Promise<AVVCatalogRepository> {
    const repository = repo ? repo : new AVVFileCatalogRepository(dataDir);
    repo = repository;
    return repository.initialise().then(() => repository);
}
