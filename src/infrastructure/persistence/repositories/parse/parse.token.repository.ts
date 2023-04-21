import { injectable } from 'inversify';
import { ParseRepositoryBase } from '../../data-store/parse/parse.repository';
import { Token as ParseToken, SCHEMA_FIELDS as TOKEN_FIELDS } from '../../data-store/parse/schema/resettoken';
import { User as ParseUser, SCHEMA_FIELDS as USER_FIELDS } from '../../data-store/parse/schema/user';
import { JsonWebTokenError } from 'jsonwebtoken';
import {
    ParseTokenRepository,
    User,
    TokenType,
    UserToken
} from './../../../../app/ports';
import { mapToUserToken } from './data-mappers';


@injectable()
export class ParseDefaultTokenRepository
    extends ParseRepositoryBase<ParseToken>
    implements ParseTokenRepository {

    constructor() {
        super();
        super.setClassName(TOKEN_FIELDS.className);
    }

    async hasTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {
        return super
            ._findIdByMatchingQuery(
                USER_FIELDS.className,
                user.uniqueId,
                [TOKEN_FIELDS.type, type.toString()],
                TOKEN_FIELDS.user)
            .then((token: ParseToken[]) => token.length > 0);
    }

    async deleteTokenForUser(
        user: User,
        type: TokenType = TokenType.ACTIVATE
    ): Promise<boolean> {

        const token: ParseToken[] | undefined = await super
            ._findIdByMatchingQuery(
                USER_FIELDS.className,
                user.uniqueId,
                [TOKEN_FIELDS.type, type.toString()],
                TOKEN_FIELDS.user
            );

        if (!token || token.length === 0) {
            return false;
        }
        const deletedToken: ParseToken = await super._delete(token[0]);
        return !!deletedToken;
    }

    async saveToken(token: UserToken): Promise<UserToken> {
        const user: ParseUser = await super._findById(token.userId, USER_FIELDS.className) as ParseUser;

        const newToken = new ParseToken({
            token: token.token,
            type: token.type.toString(),
            user: user
        });
        return super._create(newToken)
            .then(doc => mapToUserToken(doc));
    }

    async getUserTokenByJWT(token: string): Promise<UserToken> {
        return super._findOne(TOKEN_FIELDS.token, token)
            .then(token => {
                if (!token) {
                    throw new JsonWebTokenError(
                        `No UserToken for JWT Token. token=${token}`
                    );
                }
                return mapToUserToken(token);
            });
    }
}
