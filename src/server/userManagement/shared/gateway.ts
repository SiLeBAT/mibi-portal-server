import { IUserEntity, IUserToken, IUserdata, IInstitutionEntity } from './entities';
import { IModelAttributes, IEntityRepository } from './../../core';

export interface IUserModelAttributes extends IModelAttributes {
    _id?: string;
    enabled?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    institution?: string;
    userdata?: IUserdata[];
    password?: string;
}

export interface IInstitutionRepository extends IEntityRepository {
    retrieve(): Promise<IInstitutionEntity[]>;
    findById(id: string): Promise<IInstitutionEntity | null>;
}

export interface IUserdataRepository extends IEntityRepository {
    saveUserdata(userdata: IUserdata): Promise<IUserdata>;
    updateUserData(id: string, userdata: IUserdata): Promise<boolean>;
    deleteUserData(id: string): Promise<{}>;
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
    addDataToUser(userId: string, userdata: IUserdata): Promise<IUserEntity>;
    deleteDataFromUser(userId: string, userdataId: string): Promise<IUserEntity>;
}
