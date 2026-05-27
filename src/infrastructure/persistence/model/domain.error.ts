export class PersistenceError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UserNotFoundError extends PersistenceError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class UserUpdateError extends PersistenceError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class InstituteNotFoundError extends PersistenceError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}
