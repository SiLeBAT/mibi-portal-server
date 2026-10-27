import { sign, SignOptions } from 'jsonwebtoken';

// Matches jwtSecret in the APP_CONFIG the controller specs build their
// container with, so the real DefaultTokenService accepts these tokens.
export const TEST_JWT_SECRET = 'test';

export function signTestToken(
    sub: string = 'user-1',
    options: SignOptions = { expiresIn: 60 },
    secret: string = TEST_JWT_SECRET
): string {
    return sign({ sub }, secret, options);
}

export function expiredTestToken(sub: string = 'user-1'): string {
    // iat/exp an hour in the past, so the token is already expired
    const past = Math.floor(Date.now() / 1000) - 3600;
    return sign({ sub, iat: past, exp: past + 60 }, TEST_JWT_SECRET);
}

export function unsignedTestToken(sub: string = 'user-1'): string {
    return sign({ sub }, '', { algorithm: 'none' });
}

export function tamperedTestToken(sub: string = 'user-1'): string {
    const [header, , signature] = signTestToken(sub).split('.');
    const payload = Buffer.from(JSON.stringify({ sub: 'admin' })).toString(
        'base64url'
    );
    return [header, payload, signature].join('.');
}

export function bearer(token: string): string {
    return `Bearer ${token}`;
}
