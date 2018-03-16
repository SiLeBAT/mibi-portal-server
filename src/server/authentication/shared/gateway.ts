import { IUserEntity, IUserToken, IInstitutionEntity } from './entities';
import { IModelAttributes, IEntityRepository } from './../../core';

export interface IUserModelAttributes extends IModelAttributes {
    _id?: string;
    enabled?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    institution?: string;
    password?: string;
}

export interface IInstitutionRepository extends IEntityRepository {
    retrieve(): Promise<IInstitutionEntity[]>;
    findById(id: string): Promise<IInstitutionEntity | null>;
}

export interface ITokenRepository extends IEntityRepository {
    tokenForUserExists(userId: string): Promise<boolean>;
    deleteTokenForUser(userId: string): Promise<boolean>;
    saveToken(token: IUserToken): Promise<IUserToken>;
    getToken(token: string): Promise<IUserToken>;
}

export interface IUserRepository extends IEntityRepository {
    getUserById(id: string): Promise<IUserEntity>;
    getPasswordForUser(username: string): Promise<string>;
    findByUsername(username: string): Promise<IUserEntity>;
    hasUser(username: string): Promise<boolean>;
    createUser(user: IUserEntity): Promise<IUserEntity>;
    updateUser(userid: string, data: IUserModelAttributes): Promise<IUserEntity>;
}
