import { PERSISTENCE_TYPES } from './persistence.types';
import { ContainerModule, interfaces } from 'inversify';
import { Model } from 'mongoose';
import { ValidationErrorDocument } from './data-store/mongoose/schemas/validation-error.schema';
import {
    MongooseValidationErrorModel,
    MongooseUserModel,
    MongooseTokenModel,
    MongooseStateModel,
    MongooseNRLModel,
    MongooseInstitutionModel
} from './data-store/mongoose/mongoose.model';
import { UserDocument } from './data-store/mongoose/schemas/user.schema';
import { TokenDocument } from './data-store/mongoose/schemas/reset-token.schema';
import { StateDocument } from './data-store/mongoose/schemas/state.schema';
import { NrlDocument } from './data-store/mongoose/schemas/nrl.schema';
import { InstitutionDocument } from './data-store/mongoose/schemas/institution.schema';
import {
    NRLRepository,
    StateRepository,
    InstituteRepository,
    UserRepository,
    TokenRepository,
    ValidationErrorRepository,
    FileRepository,
    SearchAliasRepository,
    CatalogRepository
} from '../../app/ports';
import { MongooseNRLRepository } from './repositories/nrl.repository';
import { DefaultStateRepository } from './repositories/state.repository';
import { MongooseInstituteRepository } from './repositories/institute.repository';
import { DefaultUserRepository } from './repositories/user.repository';
import { DefaultTokenRepository } from './repositories/token.repository';
import { DefaultValidationErrorRepository } from './repositories/validation-error.repository';
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

            bind<Model<ValidationErrorDocument>>(
                PERSISTENCE_TYPES.ValidationErrorModel
            ).toConstantValue(MongooseValidationErrorModel);

            bind<Model<UserDocument>>(PERSISTENCE_TYPES.UserModel).toConstantValue(
                MongooseUserModel
            );

            bind<Model<TokenDocument>>(
                PERSISTENCE_TYPES.TokenModel
            ).toConstantValue(MongooseTokenModel);

            bind<Model<StateDocument>>(
                PERSISTENCE_TYPES.StateModel
            ).toConstantValue(MongooseStateModel);

            bind<Model<NrlDocument>>(PERSISTENCE_TYPES.NRLModel).toConstantValue(
                MongooseNRLModel
            );

            bind<Model<InstitutionDocument>>(
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
