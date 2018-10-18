import { ICatalog } from './sampleManagement';
import { IUserToken, IUser, IInstitution } from './authentication';

export {
    IRepositoryFactory,
    IServiceFactory,
    RepositoryFactory,
    ServiceFactory,
    IController,
    INotification,
    NotificationType,
    INotificationPort
} from './sharedKernel';

export {
    IRegistrationPort,
    IPasswordPort,
    ILoginPort,
    IInstitutionPort,
    LoginResult,
    IInstitution,
    IAddress,
    createInstitution,
    createUser,
    IUser,
    IUserToken,
    IUserLoginInformation,
    ILoginResponse,
    IUserBase
} from './authentication';

export {
    IFormAutoCorrectionPort,
    IFormValidatorPort,
    ISampleCollection,
    ISample,
    createSample,
    createSampleCollection,
    ICatalog,
    Catalog,
	IDatasetFile,
	ISenderInfo,
    IDatasetPort
} from './sampleManagement';

export interface IModelAttributes {
}

export interface IUpdateResponse {
}

export interface IRead<T> {
    retrieve: () => Promise<T[]>;
    findById: (id: string) => Promise<T | null>;
    findOne(cond?: Object): Promise<T | null>;
    find(cond: Object, fields: Object, options: Object): Promise<T[]>;
}

export interface IWrite<T> {
    create: (item: T) => Promise<T>;
    update: (_id: string, attributes: IModelAttributes) => Promise<IUpdateResponse>;
    delete: (_id: string) => Promise<T>;
}

export interface IRepositoryBase<T> extends IRead<T>, IWrite<T> {
}

export interface IUserModelAttributes extends IModelAttributes {
    _id?: string;
    enabled?: boolean;
    adminEnabled?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    institution?: string;
    password?: string;
}

export interface IInstitutionRepository {
    retrieve(): Promise<IInstitution[]>;
    findById(id: string): Promise<IInstitution | null>;
    createInstitution(institution: IInstitution): Promise<IInstitution>;
    findByInstitutionName(name: string): Promise<IInstitution | null>;
}

export interface ITokenRepository {
    hasTokenForUser(user: IUser): Promise<boolean>;
    hasResetTokenForUser(user: IUser): Promise<boolean>;
    hasAdminTokenForUser(user: IUser): Promise<boolean>;
    deleteTokenForUser(user: IUser): Promise<boolean>;
    deleteResetTokenForUser(user: IUser): Promise<boolean>;
    deleteAdminTokenForUser(user: IUser): Promise<boolean>;
    saveToken(token: IUserToken): Promise<IUserToken>;
    getUserTokenByJWT(token: string): Promise<IUserToken | null>;
}

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    getPasswordForUser(username: string): Promise<string | null>;
    findByUsername(username: string): Promise<IUser | null>;
    hasUser(username: string): Promise<boolean>;
    createUser(user: IUser): Promise<IUser>;
    updateUser(user: IUser): Promise<IUser | null>;
}

export interface IStateRepository {
    getAllFormats(): Promise<IAVVFormatCollection>;
}

export interface ICatalogRepository {
    // tslint:disable-next-line
    getCatalog(catalogName: string): ICatalog<any>;
}

export interface IAVVFormatCollection {
    [key: string]: string[];
}
export interface IState {
    name: string;
    short: string;
    AVV: string[];
}
