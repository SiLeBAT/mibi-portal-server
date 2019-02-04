import { createRepository, ResetTokenSchema, IResetTokenModel } from '../data-store';
import { RepositoryBase, TokenRepository, IUserToken, IUser } from '../../../app/ports';
import { TokenType } from '../../../app/authentication/domain';
import { ApplicationDomainError } from '../../../app/sharedKernel';

class DefaultTokenRepository implements TokenRepository {
    constructor(private baseRepo: RepositoryBase<IResetTokenModel>) {
    }
    hasTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.ACTIVATE }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    hasResetTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.RESET }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    hasAdminTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.find({ user: user.uniqueId, type: TokenType.ADMIN }, {}, {}).then(
            (docs) => {
                return docs.length > 0;
            }
        );
    }
    deleteTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.ACTIVATE }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    deleteResetTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.RESET }).then(
            (token: IResetTokenModel) => !!this.baseRepo.delete(token._id)
        );
    }
    deleteAdminTokenForUser(user: IUser): Promise<boolean> {
        return this.baseRepo.findOne({ user: user.uniqueId, type: TokenType.ADMIN }).then(
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
    getUserTokenByJWT(token: string): Promise<IUserToken> {
        return this.baseRepo.findOne({ token: token }).then(
            model => {
                if (!model) throw new ApplicationDomainError(`No UserToken for JWT Token. token=${token}`);
                return {
                    token: model.token,
                    type: model.type,
                    userId: model.user
                };
            }
        );
    }
}

export const repository: TokenRepository = new DefaultTokenRepository(createRepository(ResetTokenSchema));
