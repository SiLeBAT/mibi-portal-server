import { OrderDTO } from './shared-dto.model';

export interface ResetRequestDTO {
    readonly email: string;
    readonly legacySystem?: boolean;
}

export interface NewPasswordRequestDTO {
    readonly password: string;
    readonly legacySystem?: boolean;
}
export interface RegistrationDetailsDTO {
    readonly email: string;
    readonly firstName: string;
    readonly instituteId: string;
    readonly lastName: string;
    readonly password: string;
    readonly legacySystem?: boolean;
    readonly userAgent?: string;
    readonly host?: string;
}

export interface PutSamplesJSONRequestDTO {
    readonly order: OrderDTO;
}

export interface PostSubmittedRequestDTO {
    readonly order: OrderDTO;
    readonly comment?: string;
    readonly receiveAs?: string;
}

export interface RedirectedPostSubmittedRequestDTO
    extends PostSubmittedRequestDTO {
    readonly userEmail: string;
}

export interface PutValidatedRequestDTO {
    readonly order: OrderDTO;
}

export interface RedirectedPutValidatedRequestDTO
    extends PutValidatedRequestDTO {
    readonly userEmail: string | null;
}
