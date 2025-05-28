import {
    Catalog,
    CatalogData,
    CatalogRepository,
    createCatalog
} from '../../../app/ports';
import { logger } from '../../../aspects';
import { loadJSONFile } from '../data-store/file/file-loader';

class FileCatalogRepository implements CatalogRepository {
    private catalogs: {
        [key: string]: Catalog<CatalogData>;
    };
    private catalogNames: string[] = [];

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
                        (jsonData: { data: CatalogData[]; uId: string }) => {
                            this.catalogs[catalogName] = createCatalog(
                                jsonData.data,
                                jsonData.uId
                            );
                            return;
                        }
                    )
                    .catch(error => {
                        logger.warn(
                            `mibi-server: Error loading catalog from json file: ${error}`
                        );
                    });
            })
        ).then(() => {
            logger.info(
                `mibi-server: ${this.constructor.name}.${this.initialise.name}, finished initialising Catalog Repository from Filesystem.`
            );
        });
    }

    getCatalog<T extends CatalogData>(catalogName: string): Catalog<T> {
        return this.catalogs[catalogName] as Catalog<T>;
    }
}

export async function initialiseRepository(
    dataDir: string
): Promise<CatalogRepository> {
    return new FileCatalogRepository(dataDir);
}
