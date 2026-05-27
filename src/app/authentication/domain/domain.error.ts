import { ApplicationDomainError } from '../../core/domain/domain.error';

export class AuthorizationError extends ApplicationDomainError {
    timeToWait: number = 0;
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class UserNotActivatedError extends ApplicationDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class UserNotVerifiedError extends ApplicationDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}

export class UserAlreadyExistsError extends ApplicationDomainError {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(message?: string) {
        super(message);
    }
}
