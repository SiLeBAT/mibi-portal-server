import { PERSISTENCE_TYPES } from './persistence.types';
import { ContainerModule, interfaces } from 'inversify';
import {
    FileRepository,
    SearchAliasRepository,
    CatalogRepository,
    ParseUserRepository,
    ParseInstituteRepository,
    ParseNRLRepository,
    ParseTokenRepository,
    ParseStateRepository,
    ParseValidationErrorRepository
} from '../../app/ports';

import { ParseDefaultUserRepository } from './repositories/parse/parse.user.repository';
import { ParseDefaultInstituteRepository } from './repositories/parse/parse.institute.repository';
import { ParseDefaultNRLRepository } from './repositories/parse/parse.nrl.repository';
import { ParseDefaultTokenRepository } from './repositories/parse/parse.token.repository';
import { ParseDefaultStateRepository } from './repositories/parse/parse.state.repository';
import { ParseDefaultValidationErrorRepository } from './repositories/parse/parse.validation-error.repository';

import { DefaultFileRepository } from './repositories/file.repository';
import { APPLICATION_TYPES } from './../../app/application.types';

export interface PersistenceContainerModuleConfig {
    searchAliasRepository: SearchAliasRepository;
    catalogRepository: CatalogRepository;
    dataDir: string;
}

export function getPersistenceContainerModule({
    searchAliasRepository,
    catalogRepository,
    dataDir
}: PersistenceContainerModuleConfig): ContainerModule {
    return new ContainerModule(
        (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
            bind(APPLICATION_TYPES.SearchAliasRepository).toConstantValue(
                searchAliasRepository
            );
            bind(APPLICATION_TYPES.CatalogRepository).toConstantValue(
                catalogRepository
            );
            bind(PERSISTENCE_TYPES.DataDir).toConstantValue(dataDir);

            bind<FileRepository>(APPLICATION_TYPES.FileRepository).to(
                DefaultFileRepository
            );

            bind<ParseUserRepository>(APPLICATION_TYPES.ParseUserRepository).to(
                ParseDefaultUserRepository
            );

            bind<ParseInstituteRepository>(APPLICATION_TYPES.ParseInstituteRepository).to(
                ParseDefaultInstituteRepository
            );

            bind<ParseNRLRepository>(APPLICATION_TYPES.ParseNRLRepository).to(
                ParseDefaultNRLRepository
            );

            bind<ParseTokenRepository>(APPLICATION_TYPES.ParseTokenRepository).to(
                ParseDefaultTokenRepository
            );

            bind<ParseStateRepository>(APPLICATION_TYPES.ParseStateRepository).to(
                ParseDefaultStateRepository
            );

            bind<ParseValidationErrorRepository>(APPLICATION_TYPES.ParseValidationErrorRepository).to(
                ParseDefaultValidationErrorRepository
            );
        }
    );
}
