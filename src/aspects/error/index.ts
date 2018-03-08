
export class ServerError extends Error {
    // tslint:disable-next-line
    constructor(...args: any[]) {

        // Calling parent constructor of base Error class.
        super(...args);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

    }
}

export class InvalidUserError extends ServerError {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        super(...args);
    }
}

export class InvalidTokenError extends ServerError {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        super(...args);
    }
}

export class InvalidOperationError extends ServerError {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        super(...args);
    }
}

export class InvalidRepositoryError extends ServerError {
    // tslint:disable-next-line
    constructor(...args: any[]) {
        super(...args);
    }
}
