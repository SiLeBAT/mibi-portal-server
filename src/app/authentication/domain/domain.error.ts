import { ApplicationDomainError } from '../../core/domain/domain.error';

export class AuthorizationError extends ApplicationDomainError {
    timeToWait: number = 0;
}

export class UserNotActivatedError extends ApplicationDomainError {}

export class UserNotVerifiedError extends ApplicationDomainError {}

export class UserAlreadyExistsError extends ApplicationDomainError {}
