import {
    TokenRepository,
    UserToken,
    User,
    ApplicationDomainError,
    TokenType
} from '../../../app/ports';
import { ResetTokenModel } from '../data-store/mongoose/schemas/resetToken.schema';
import { ResetTokenSchema } from '../data-store/mongoose/mongoose';
import {
    createRepository,
    RepositoryBase
} from '../data-store/mongoose/mongoose.repository';

class DefaultTokenRepository implements TokenRepository {
    constructor(private baseRepo: RepositoryBase<ResetTokenModel>) {}
    hasTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .find({ user: user.uniqueId, type: TokenType.ACTIVATE }, {}, {})
            .then(docs => {
                return docs.length > 0;
            });
    }
    hasResetTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .find({ user: user.uniqueId, type: TokenType.RESET }, {}, {})
            .then(docs => {
                return docs.length > 0;
            });
    }
    hasAdminTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .find({ user: user.uniqueId, type: TokenType.ADMIN }, {}, {})
            .then(docs => {
                return docs.length > 0;
            });
    }
    deleteTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .findOne({ user: user.uniqueId, type: TokenType.ACTIVATE })
            .then(
                (token: ResetTokenModel) => !!this.baseRepo.delete(token._id)
            );
    }
    deleteResetTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .findOne({ user: user.uniqueId, type: TokenType.RESET })
            .then(
                (token: ResetTokenModel) => !!this.baseRepo.delete(token._id)
            );
    }
    deleteAdminTokenForUser(user: User): Promise<boolean> {
        return this.baseRepo
            .findOne({ user: user.uniqueId, type: TokenType.ADMIN })
            .then(
                (token: ResetTokenModel) => !!this.baseRepo.delete(token._id)
            );
    }
    saveToken(token: UserToken): Promise<UserToken> {
        const newToken = new ResetTokenSchema({
            token: token.token,
            type: token.type,
            user: token.userId
        });
        return this.baseRepo.create(newToken).then(res => newToken);
    }
    getUserTokenByJWT(token: string): Promise<UserToken> {
        return this.baseRepo.findOne({ token: token }).then(model => {
            if (!model) {
                throw new ApplicationDomainError(
                    `No UserToken for JWT Token. token=${token}`
                );
            }
            return {
                token: model.token,
                type: model.type,
                userId: model.user
            };
        });
    }
}

export const repository: TokenRepository = new DefaultTokenRepository(
    createRepository(ResetTokenSchema)
);
