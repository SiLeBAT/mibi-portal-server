import { ICatalog, INRL, ValidationError } from './sampleManagement';
import { IUserToken, User, Institute } from './authentication';

export {
    IServiceFactory,
    ServiceFactory,
    IController,
    INotification,
    NotificationType,
    INotificationPort
} from './sharedKernel';

export {
    RegistrationPort,
    PasswordPort,
    LoginPort,
    InstitutionPort,
    LoginResult,
    Institute,
    createInstitution,
    createUser,
    User,
    IUserToken,
    UserLoginInformation,
    LoginResponse,
    IUserBase
} from './authentication';

export {
    IFormAutoCorrectionPort,
    FormValidatorPort,
    SampleCollection,
    Sample,
    createSample,
    createSampleCollection,
    ICatalog,
    Catalog,
    IDatasetFile,
    ISenderInfo,
    IDatasetPort,
    ValidationError,
    INRL
} from './sampleManagement';

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
    saveToken(token: IUserToken): Promise<IUserToken>;
    getUserTokenByJWT(token: string): Promise<IUserToken>;
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
    getAllNRLs(): Promise<INRL[]>;
}

export interface CatalogRepository {
    // tslint:disable-next-line
    getCatalog(catalogName: string): ICatalog<any>;
}

export interface AVVFormatCollection {
    [key: string]: string[];
}
export interface State {
    name: string;
    short: string;
    AVV: string[];
}
