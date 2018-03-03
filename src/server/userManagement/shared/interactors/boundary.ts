import { IUser } from "../entities";
import { IUserExtended } from "../entities";

export interface IUserDataRepository {
    saveUserdata(userdata: any): Promise<boolean>;
    updateUserData(id, userdata): Promise<boolean>;
    deleteUserData(id): Promise<any>;
}

export interface ITokenRepository {
    hasTokenForUser(userId: string): Promise<boolean>;
    deleteTokenForUser(userId: string): Promise<boolean>;
    // TODO remove any 
    saveToken(token: any): Promise<boolean>;
    getToken(token: string): Promise<any[]>;
}

export interface IUserRepository {
    getAll(): Promise<IUser[]>;
    findByUsername(username: string): Promise<IUser>;
    getPasswordForUser(username: string): Promise<string>;
    // FIXME remove this
    findByUsernameWithAuxilliary(username: string): Promise<IUserExtended>;
    hasUser(username: string): Promise<boolean>;
    // TODO remove any 
    saveUser(user: any): Promise<IUser>;
    updateUser(userId, opts): Promise<any>;
    addDataToUser(userId, userdata): Promise<IUserExtended>;
    deleteDataFromUser(userId, userdata): Promise<IUserExtended>;
}
