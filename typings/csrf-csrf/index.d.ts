import { Request, Response, NextFunction, CookieOptions } from 'express';

export type SameSiteType = boolean | 'lax' | 'strict' | 'none';
export type TokenRetriever = (req: Request) => string | null | undefined;
export type CsrfSecretRetriever = (req?: Request) => string | Array<string>;
export type doubleCsrfProtection = (req: Request, res: Response, next: NextFunction) => void;
export type CsrfTokenCreator = (req: Request, res: Response, overwrite?: boolean, validateOnReuse?: boolean) => string;
export type CsrfRequestValidator = (req: Request) => boolean;

export interface DoubleCsrfCookieOptions extends CookieOptions {}

export interface DoubleCsrfConfigOptions {
    getSecret: CsrfSecretRetriever;
    cookieName?: string;
    cookieOptions?: DoubleCsrfCookieOptions;
    size?: number;
    ignoredMethods?: Array<string>;
    getTokenFromRequest?: TokenRetriever;
    skipCsrfProtection?: (req: Request) => boolean;
    [key: string]: unknown;
}

export interface DoubleCsrfUtilities {
    generateToken: CsrfTokenCreator;
    validateRequest: CsrfRequestValidator;
    doubleCsrfProtection: doubleCsrfProtection;
}

export declare function doubleCsrf(options: DoubleCsrfConfigOptions): DoubleCsrfUtilities;
