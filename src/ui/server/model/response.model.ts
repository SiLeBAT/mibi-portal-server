import { SampleDataDTO } from './shared-dto.model';

export interface RegistrationRequestResponseDTO {
    registerRequest: boolean;
    email: string;
}

export interface PasswordResetRequestResponseDTO {
    passwordResetRequest: boolean;
    email: string;
}

export interface PasswordResetResponseDTO {
    passwordReset: boolean;
}

export interface ActivationResponseDTO {
    activation: boolean;
    username: string;
}

export interface TokenRefreshConfirmationResponseDTO {
    refresh: boolean;
    token: string;
}

interface ErrorDTO {
    code: number;
    message: string;
}

export interface DefaultServerErrorDTO extends ErrorDTO {}

export interface InvalidInputErrorDTO extends DefaultServerErrorDTO {
    samples: SampleDataDTO[];
}

export interface AutoCorrectedInputErrorDTO extends DefaultServerErrorDTO {
    samples: SampleDataDTO[];
}

export interface FailedLoginErrorDTO extends ErrorDTO {
    waitTime?: number;
}

export interface TokenizedUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    token: string;
    instituteId: string;
}

export interface SystemInformationDTO {
    version: string;
    lastChange: string;
    supportContact: string;
}

export interface InstituteCollectionDTO {
    institutes: InstituteDTO[];
}
export interface InstituteDTO {
    id: string;
    short: string;
    name: string;
    addendum: string;
    city: string;
    zip: string;
    phone: string;
    fax: string;
    email: string[];
}
