import { ContainerModule, interfaces } from 'inversify';
import {
    ParseNRLRepository,
    ParseStateRepository,
    ParseInstituteRepository,
    ParseUserRepository,
    ParseTokenRepository,
    ParseValidationErrorRepository,
    FileRepository
} from '../../../app/ports';
import { APPLICATION_TYPES } from '../../../app/application.types';
import { getMockNRLRepository } from './nrl.repository';
import { getMockStateRepository } from './state.repository';
import { getMockInstituteRepository } from './institute.repository';
import { getMockTokenRepository } from './token.repository';
import { getMockValidationErrorRepository } from './validation-error.repository';
import { getMockFileRepository } from './file.repository';
import { getMockUserRepository } from './user.repository';
import { getMockSearchAliasRepository } from './search-alias.repository';
import { getMockCatalogRepository } from './catalog.repository';
import { getMockAVVCatalogRepository } from './avvcatalog.repository';

export const mockPersistenceContainerModule = new ContainerModule(
    (bind: interfaces.Bind, unbind: interfaces.Unbind) => {
        bind<ParseNRLRepository>(
            APPLICATION_TYPES.ParseNRLRepository
        ).toConstantValue(getMockNRLRepository());

        bind<ParseStateRepository>(
            APPLICATION_TYPES.ParseStateRepository
        ).toConstantValue(getMockStateRepository());

        bind<ParseInstituteRepository>(
            APPLICATION_TYPES.ParseInstituteRepository
        ).toConstantValue(getMockInstituteRepository());

        bind<ParseUserRepository>(
            APPLICATION_TYPES.ParseUserRepository
        ).toConstantValue(getMockUserRepository());

        bind<ParseTokenRepository>(
            APPLICATION_TYPES.ParseTokenRepository
        ).toConstantValue(getMockTokenRepository());

        bind<ParseValidationErrorRepository>(
            APPLICATION_TYPES.ParseValidationErrorRepository
        ).toConstantValue(getMockValidationErrorRepository());

        bind<FileRepository>(APPLICATION_TYPES.FileRepository).toConstantValue(
            getMockFileRepository()
        );
        bind(APPLICATION_TYPES.SearchAliasRepository).toConstantValue(
            getMockSearchAliasRepository()
        );
        bind(APPLICATION_TYPES.CatalogRepository).toConstantValue(
            getMockCatalogRepository()
        );
        bind(APPLICATION_TYPES.AVVCatalogRepository).toConstantValue(
            getMockAVVCatalogRepository()
        );
    }
);
