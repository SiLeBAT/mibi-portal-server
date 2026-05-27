export class ServerDomainError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class MalformedRequestError extends ServerDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class TokenNotFoundError extends ServerDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class UnknownPackageConfigurationError extends ServerDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}
