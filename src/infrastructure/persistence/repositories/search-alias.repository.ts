import { logger } from '../../../aspects';
import { loadJSONFile } from '../data-store/file/file-loader';
import {
    ApplicationSystemError,
    SearchAliasRepository,
    SearchAlias
} from '../../../app/ports';

class FileSearchAliasRepository implements SearchAliasRepository {
    private fileName = 'search-alias.json';

    private aliases: SearchAlias[] = [];

    initialise() {
        logger.verbose(
            `FileSearchAliasRepository.initialize, Loading Search Alias data from Filesystem.`
        );

        return loadJSONFile(this.fileName)
            .then(
                // tslint:disable-next-line:no-any
                (data: SearchAlias[]) => {
                    this.aliases = data;
                },
                (error: Error) => {
                    throw new ApplicationSystemError(
                        `No search alias file found. error=${error}`
                    );
                }
            )
            .then(() =>
                logger.info(
                    `Finished initialising Search Alias Repository from Filesystem.`
                )
            );
    }

    getAliases() {
        return this.aliases;
    }
}
const repository = new FileSearchAliasRepository();

export async function initialiseRepository() {
    return repository.initialise().then(() => repository);
}
