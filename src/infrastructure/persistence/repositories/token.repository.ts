import { inject, injectable } from 'inversify';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { MongooseRepositoryBase } from '../data-store/mongoose/mongoose.repository';
import { TokenModel } from '../data-store/mongoose/schemas/reset-token.schema';
import { PERSISTENCE_TYPES } from '../persistence.types';
import {
    TokenRepository,
    TokenType,
    User,
    UserToken
} from './../../../app/ports';

@injectable()
export class DefaultTokenRepository extends MongooseRepositoryBase<TokenModel>
    implements TokenRepository {
    constructor(
        @inject(PERSISTENCE_TYPES.TokenModel) private model: Model<TokenModel>
    ) {
        super(model);
    }
    async hasTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return super._find({ user: user.uniqueId, type }, {}, {}).then(docs => {
            return docs.length > 0;
        });
    }
    async deleteTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        let token = await super._findOne({ user: user.uniqueId, type });
        if (token === null) {
            return false;
        }
        token = await super._delete(token._id);
        return token !== null;
    }

    async saveToken(token: UserToken): Promise<UserToken> {
        const newToken = new this.model({
            token: token.token,
            type: token.type,
            user: token.userId
        });
        return super._create(newToken).then(res => newToken);
    }
    async getUserTokenByJWT(token: string): Promise<UserToken> {
        return super._findOne({ token: token }).then(model => {
            if (!model) {
                throw new JsonWebTokenError(
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
