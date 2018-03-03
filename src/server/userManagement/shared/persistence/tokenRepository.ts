import { ITokenRepository } from "./../interactors";
import { ResetToken } from "./../../../../peripherals/dataStore";
import { logger } from './../../../../aspects'

class MongooseTokenRepository implements ITokenRepository {
    hasTokenForUser(userId: string): Promise<boolean> {
        return ResetToken.find({ user: userId }).then(
            docs => !!docs.length
        );
    }
    deleteTokenForUser(userId: string): Promise<boolean> {
        return ResetToken
            .remove()
            .where('user').equals(userId);
    }
    // TODO remove any 
    saveToken(token: any): Promise<boolean> {
        const newToken = new ResetToken(token);
        return newToken.save().then(
            model => ({
                token: model.token,
                type: model.type,
                user: model.user

            })
        );
    }
    getToken(token: string): Promise<any> {
        return ResetToken
            .find()
            .lean()
            .where('token').equals(token);
    }
}

export const repository: ITokenRepository = new MongooseTokenRepository();