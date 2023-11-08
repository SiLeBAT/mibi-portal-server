import { OrderDTO } from './shared-dto.model';
import { ExcelFileInfo } from '../../../app/ports';

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

export interface PutSamplesXLSXResponseDTO extends ExcelFileInfo {}

export interface PutSamplesJSONResponseDTO {
    order: OrderDTO;
}

export interface PutValidatedResponseDTO {
    order: OrderDTO;
}

export interface PostSubmittedResponseDTO {
    order: OrderDTO;
}

interface ErrorDTO {
    code: number;
    message: string;
}

export interface DefaultServerErrorDTO extends ErrorDTO { }

export interface InvalidExcelVersionErrorDTO extends ErrorDTO {
    version: string;
}

export interface InvalidInputErrorDTO extends DefaultServerErrorDTO {
    order: OrderDTO;
}

export interface AutoCorrectedInputErrorDTO extends DefaultServerErrorDTO {
    order: OrderDTO;
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

export interface NRLCollectionDTO {
    nrls: NRLDTO[];
}
export interface NRLDTO {
    id: string;
    standardProcedures: AnalysisProcedureDTO[];
    optionalProcedures: AnalysisProcedureDTO[];
}

interface AnalysisProcedureDTO {
    value: string;
    key: number;
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
