export class ServerDomainError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class MalformedRequestError extends ServerDomainError {}
export class TokenNotFoundError extends ServerDomainError {}
export class UnknownPackageConfigurationError extends ServerDomainError {}
