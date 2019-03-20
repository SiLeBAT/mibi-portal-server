import {
    ValidationError,
    NRLConfig,
    SearchAlias
} from './sampleManagement/model/validation.model';
import { Catalog } from './sampleManagement/model/catalog.model';
import { UserToken, User } from './authentication/model/user.model';
import { Institute } from './authentication/model/institute.model';

/**
 * core exports
 */
export {
    ServerConfiguration,
    DataStoreConfiguration,
    MailConfiguration,
    GeneralConfiguration,
    ConfigurationPort
} from './core/model/configuration.model';

export {
    Notification,
    NotificationPort
} from './core/model/notification.model';

export {
    IServiceFactory,
    ServiceFactory
} from './core/factories/service.factory';

export {
    getConfigurationService
} from './core/application/configuration.service';

export {
    getNotificationService
} from './core/application/notification.service';

export { NotificationType } from './core/domain/enums';

export { ApplicationDomainError } from './core/domain/domain.error';

export { ApplicationSystemError } from './core/domain/technical.error';

/**
 * authentication exports
 */
export { LoginResult, TokenType } from './authentication/domain/enums';

export {
    Institute,
    InstitutePort
} from './authentication/model/institute.model';

export {
    UserLoginInformation,
    LoginResponse,
    LoginPort,
    PasswordPort
} from './authentication/model/login.model';

export { RegistrationPort } from './authentication/model/registration.model';

export { User, UserToken } from './authentication/model/user.model';

export { createInstitution } from './authentication/domain/institute.entity';

export { createUser } from './authentication/domain/user.entity';

export { generateToken } from './authentication/domain/token.service';

/**
 * sampleManagement exports
 */
export {
    SampleCollection,
    Sample,
    DatasetFile,
    SenderInfo,
    DatasetPort
} from './sampleManagement/model/sample.model';

export {
    EditValue,
    CorrectionSuggestions,
    FormAutoCorrectionPort
} from './sampleManagement/model/autocorrection.model';

export { Catalog } from './sampleManagement/model/catalog.model';

export {
    ValidationError,
    NRLConfig,
    FormValidatorPort,
    ValidationOptions,
    SearchAlias
} from './sampleManagement/model/validation.model';

export { createCatalog } from './sampleManagement/domain/catalog.entity';

export {
    createSampleCollection
} from './sampleManagement/domain/sample-collection.entity';

export { createSample } from './sampleManagement/domain/sample.entity';

// FIXME: Move these elsewhere
export interface ModelAttributes {}

export interface UpdateResponse {}

export interface Read<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

export interface Write<T> {
    create: (item: T) => Promise<T>;
    update: (
        _id: string,
        attributes: ModelAttributes
    ) => Promise<UpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface RepositoryBase<T> extends Read<T>, Write<T> {}

export interface UserModelAttributes extends ModelAttributes {
    _id?: string;
    enabled?: boolean;
    adminEnabled?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    institution?: string;
    password?: string;
}

export interface InstituteRepository {
    retrieve(): Promise<Institute[]>;
    findById(id: string): Promise<Institute>;
    createInstitution(institution: Institute): Promise<Institute>;
    findByInstitutionName(name: string): Promise<Institute>;
}

export interface TokenRepository {
    hasTokenForUser(user: User): Promise<boolean>;
    hasResetTokenForUser(user: User): Promise<boolean>;
    hasAdminTokenForUser(user: User): Promise<boolean>;
    deleteTokenForUser(user: User): Promise<boolean>;
    deleteResetTokenForUser(user: User): Promise<boolean>;
    deleteAdminTokenForUser(user: User): Promise<boolean>;
    saveToken(token: UserToken): Promise<UserToken>;
    getUserTokenByJWT(token: string): Promise<UserToken>;
}

export interface UserRepository {
    findById(id: string): Promise<User>;
    getPasswordForUser(username: string): Promise<string>;
    findByUsername(username: string): Promise<User>;
    hasUser(username: string): Promise<boolean>;
    createUser(user: User): Promise<User>;
    updateUser(user: User): Promise<User>;
}

export interface ValidationErrorRepository {
    getAllErrors(): Promise<ValidationError[]>;
}
export interface StateRepository {
    getAllFormats(): Promise<AVVFormatCollection>;
}

export interface NRLRepository {
    getAllNRLs(): Promise<NRLConfig[]>;
}

export interface CatalogRepository {
    // tslint:disable-next-line
    getCatalog(catalogName: string): Catalog<any>;
}

export interface SearchAliasRepository {
    getAliases(): SearchAlias[];
}

export interface AVVFormatCollection {
    [key: string]: string[];
}
export interface State {
    name: string;
    short: string;
    AVV: string[];
}
