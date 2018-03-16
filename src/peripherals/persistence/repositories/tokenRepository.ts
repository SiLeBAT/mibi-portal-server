import { InvalidTokenError } from './../../../aspects';
import { createRepository, ResetTokenSchema, IResetTokenModel } from './../dataStore';
import { ITokenRepository, IUserToken, IRepositoryBase } from './../../../server';

class TokenRepository implements ITokenRepository {
    constructor(private baseRepo: IRepositoryBase<IResetTokenModel>) {
    }
    tokenForUserExists(userId: string): Promise<boolean> {
        return this.baseRepo.find({ user: userId }, {}, {}).then(
            docs => docs.length > 0
        );
    }
    deleteTokenForUser(userId: string): Promise<boolean> {
        return this.baseRepo.findOne({ user: userId }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    saveToken(token: IUserToken): Promise<IUserToken> {
        const newToken = new ResetTokenSchema(token);
        return this.baseRepo.create(newToken).then(
            res => newToken
        );
    }
    getToken(token: string): Promise<IUserToken> {
        return this.baseRepo.findOne({ token: token }).then(
            model => {
                if (!model) {
                    throw new InvalidTokenError(`Token not found, token=${token}`);
                }
                return {
                    token: model.token,
                    type: model.type,
                    user: model.user
                };
            }
        );
    }
}

export const repository: ITokenRepository = new TokenRepository(createRepository(ResetTokenSchema));
