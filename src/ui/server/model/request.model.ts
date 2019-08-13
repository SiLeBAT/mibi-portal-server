import { OrderDTO } from './shared-dto.model';

export interface ResetRequestDTO {
    readonly email: string;
}

export interface NewPasswordRequestDTO {
    readonly password: string;
}
export interface RegistrationDetailsDTO {
    readonly email: string;
    readonly firstName: string;
    readonly instituteId: string;
    readonly lastName: string;
    readonly password: string;
}

export interface PutSamplesJSONRequestDTO {
    readonly order: OrderDTO;
}

export interface PostSubmittedRequestDTO {
    readonly order: OrderDTO;
    readonly comment?: string;
}

export interface PutValidatedRequestDTO {
    readonly order: OrderDTO;
}
