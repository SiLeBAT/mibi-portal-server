import { SearchAlias, SearchAliasRepository } from '../../../app/ports';
import { logger } from '../../../aspects';
import { loadJSONFile } from '../data-store/file/file-loader';

class FileSearchAliasRepository implements SearchAliasRepository {
    private fileName = 'search-alias.json';

    private aliases: SearchAlias[] = [];

    constructor(private dataDir: string) {}

    async initialise(): Promise<void> {
        logger.verbose(
            `${this.constructor.name}.${this.initialise.name}, loading Search Alias data from Filesystem.`
        );

        return loadJSONFile(this.fileName, this.dataDir)
            .then(
                // tslint:disable-next-line:no-any
                (data: SearchAlias[]) => {
                    this.aliases = data;
                },
                (error: Error) => {
                    throw error;
                }
            )
            .then(() => {
                logger.info(
                    `${this.constructor.name}.${this.initialise.name}, finished initialising Search Alias Repository from Filesystem.`
                );
            });
    }

    getAliases() {
        return this.aliases;
    }
}

export async function initialiseRepository(
    dataDir: string
): Promise<SearchAliasRepository> {
    return new FileSearchAliasRepository(dataDir);
}
