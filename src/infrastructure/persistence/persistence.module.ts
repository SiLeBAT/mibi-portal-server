import { ContainerModule, interfaces } from 'inversify';
import { Model } from 'mongoose';
import {
    CatalogRepository,
    FileRepository,
    InstituteRepository,
    NRLRepository,
    SearchAliasRepository,
    StateRepository,
    TokenRepository,
    UserRepository,
    ValidationErrorRepository
} from '../../app/ports';
import { APPLICATION_TYPES } from './../../app/application.types';
import {
    MongooseInstitutionModel,
    MongooseNRLModel,
    MongooseStateModel,
    MongooseTokenModel,
    MongooseUserModel,
    MongooseValidationErrorModel
} from './data-store/mongoose/mongoose.model';
import { InstitutionModel } from './data-store/mongoose/schemas/institution.schema';
import { NRLModel } from './data-store/mongoose/schemas/nrl.schema';
import { TokenModel } from './data-store/mongoose/schemas/reset-token.schema';
import { StateModel } from './data-store/mongoose/schemas/state.schema';
import { UserModel } from './data-store/mongoose/schemas/user.schema';
import { ValidationErrorModel } from './data-store/mongoose/schemas/validation-error.schema';
import { PERSISTENCE_TYPES } from './persistence.types';
import { DefaultFileRepository } from './repositories/file.repository';
import { MongooseInstituteRepository } from './repositories/institute.repository';
import { MongooseNRLRepository } from './repositories/nrl.repository';
import { DefaultStateRepository } from './repositories/state.repository';
import { DefaultTokenRepository } from './repositories/token.repository';
import { DefaultUserRepository } from './repositories/user.repository';
import { DefaultValidationErrorRepository } from './repositories/validation-error.repository';

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

            bind<Model<ValidationErrorModel>>(
                PERSISTENCE_TYPES.ValidationErrorModel
            ).toConstantValue(MongooseValidationErrorModel);

            bind<Model<UserModel>>(PERSISTENCE_TYPES.UserModel).toConstantValue(
                MongooseUserModel
            );

            bind<Model<TokenModel>>(
                PERSISTENCE_TYPES.TokenModel
            ).toConstantValue(MongooseTokenModel);

            bind<Model<StateModel>>(
                PERSISTENCE_TYPES.StateModel
            ).toConstantValue(MongooseStateModel);

            bind<Model<NRLModel>>(PERSISTENCE_TYPES.NRLModel).toConstantValue(
                MongooseNRLModel
            );

            bind<Model<InstitutionModel>>(
                PERSISTENCE_TYPES.InstitutionModel
            ).toConstantValue(MongooseInstitutionModel);

            bind<NRLRepository>(APPLICATION_TYPES.NRLRepository).to(
                MongooseNRLRepository
            );

            bind<StateRepository>(APPLICATION_TYPES.StateRepository).to(
                DefaultStateRepository
            );

            bind<InstituteRepository>(APPLICATION_TYPES.InstituteRepository).to(
                MongooseInstituteRepository
            );

            bind<UserRepository>(APPLICATION_TYPES.UserRepository).to(
                DefaultUserRepository
            );

            bind<TokenRepository>(APPLICATION_TYPES.TokenRepository).to(
                DefaultTokenRepository
            );

            bind<ValidationErrorRepository>(
                APPLICATION_TYPES.ValidationErrorRepository
            ).to(DefaultValidationErrorRepository);

            bind<FileRepository>(APPLICATION_TYPES.FileRepository).to(
                DefaultFileRepository
            );
        }
    );
}
