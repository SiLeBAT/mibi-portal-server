import {
    ValidationError,
    NRLConfig,
    SearchAlias,
    AVVFormatCollection
} from '../sampleManagement/model/validation.model';
import { Catalog, CatalogData } from '../sampleManagement/model/catalog.model';
import { UserToken, User } from '../authentication/model/user.model';
import { Institute } from '../authentication/model/institute.model';

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
    getCatalog(catalogName: string): Catalog<CatalogData>;
}

export interface SearchAliasRepository {
    getAliases(): SearchAlias[];
}
