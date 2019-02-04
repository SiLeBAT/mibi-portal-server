import { ICatalog, INRL, ValidationError } from './sampleManagement';
import { IUserToken, IUser, Institution } from './authentication';

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
    IInstitutionPort,
    LoginResult,
    Institution,
    Address,
    createInstitution,
    createUser,
    IUser,
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

export interface ModelAttributes {
}

export interface UpdateResponse {
}

export interface Read<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

export interface Write<T> {
    create: (item: T) => Promise<T>;
    update: (_id: string, attributes: ModelAttributes) => Promise<UpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface RepositoryBase<T> extends Read<T>, Write<T> {
}

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

export interface InstitutionRepository {
    retrieve(): Promise<Institution[]>;
    findById(id: string): Promise<Institution>;
    createInstitution(institution: Institution): Promise<Institution>;
    findByInstitutionName(name: string): Promise<Institution>;
}

export interface TokenRepository {
    hasTokenForUser(user: IUser): Promise<boolean>;
    hasResetTokenForUser(user: IUser): Promise<boolean>;
    hasAdminTokenForUser(user: IUser): Promise<boolean>;
    deleteTokenForUser(user: IUser): Promise<boolean>;
    deleteResetTokenForUser(user: IUser): Promise<boolean>;
    deleteAdminTokenForUser(user: IUser): Promise<boolean>;
    saveToken(token: IUserToken): Promise<IUserToken>;
    getUserTokenByJWT(token: string): Promise<IUserToken>;
}

export interface UserRepository {
    findById(id: string): Promise<IUser>;
    getPasswordForUser(username: string): Promise<string>;
    findByUsername(username: string): Promise<IUser>;
    hasUser(username: string): Promise<boolean>;
    createUser(user: IUser): Promise<IUser>;
    updateUser(user: IUser): Promise<IUser>;
}

export interface ValidationErrorRepository {
    getAllErrors(): Promise<ValidationError[]>;
}
export interface StateRepository {
    getAllFormats(): Promise<AVVFormatCollection>;
}

export interface NRLRepository {
    getAllNRLs(): Promise<INRL[]> ;
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
