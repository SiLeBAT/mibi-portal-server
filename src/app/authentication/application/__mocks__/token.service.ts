import { TokenType } from '../../domain/enums';

// The stored token's type drives the type check in verifyUser/activateUser, so
// callers can pick which type getUserTokenByJWT/saveToken report (defaults to
// ACTIVATE, the type used by the verification flow).
export function getMockTokenService(tokenType: TokenType = TokenType.ACTIVATE) {
    return {
        generateToken: jest.fn(),
        saveToken: jest.fn(() =>
            Promise.resolve({
                token: 'test',
                type: tokenType,
                userId: 'test'
            })
        ),
        generateAdminToken: jest.fn(),
        verifyTokenWithUser: jest.fn(),
        verifyToken: jest.fn(),
        getUserTokenByJWT: jest.fn(() =>
            Promise.resolve({
                token: 'test',
                type: tokenType,
                userId: 'test'
            })
        ),
        deleteTokenForUser: jest.fn(() => Promise.resolve(true)),
        hasTokenForUser: jest.fn(() => Promise.resolve(true))
    };
}
