import { createRepository, ResetTokenSchema, IResetTokenModel } from './../dataStore';
import { IRepositoryBase, ITokenRepository, IUserToken, IUser } from './../../../app/ports';

class TokenRepository implements ITokenRepository {
    constructor(private baseRepo: IRepositoryBase<IResetTokenModel>) {
    }
    hasTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId }, {}, {}).then(
            docs => docs.length > 0
        );
    }
    deleteTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    saveToken(token: IUserToken): Promise<IUserToken> {
        const newToken = new ResetTokenSchema({
            token: token.token,
            type: token.type,
            user: token.userId
        });
        return this.baseRepo.create(newToken).then(
            res => newToken
        );
    }
    getUserTokenByJWT(token: string): Promise<IUserToken | null> {
        return this.baseRepo.findOne({ token: token }).then(
            model => {
                if (!model) return null;
                return {
                    token: model.token,
                    type: model.type,
                    userId: model.user
                };
            }
        );
    }
}

export const repository: ITokenRepository = new TokenRepository(createRepository(ResetTokenSchema));
