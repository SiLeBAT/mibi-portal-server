export class PersistenceError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class UserNotFoundError extends PersistenceError {}
export class UserUpdateError extends PersistenceError {}
export class InstituteNotFoundError extends PersistenceError {}
