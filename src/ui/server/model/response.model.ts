import { OrderDTO, SampleDataDTO, SampleMetaDTO } from './shared-dto.model';

interface ExcelFileInfo {
    data: string;
    fileName: string;
    type: string;
}

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

export interface DefaultServerErrorDTO extends ErrorDTO {}

export interface InvalidExcelVersionErrorDTO extends DefaultServerErrorDTO {
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
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
}

export interface UserConsentResponseDTO {
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
}

export interface MeResponseDTO {
    sub: string;
    email: string;
    preferred_username: string;
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
}

export interface SystemInformationDTO {
    version: string;
    lastChange: string;
    supportContact: string;
    // Mirrors the server's keycloak.enabled flag so the SPA can pick the legacy
    // login form vs. the Keycloak SSO redirect at runtime, without a rebuild.
    keycloakEnabled: boolean;
}

export interface ZomoPlanFileCollectionDTO {
    zomoPlanFiles: ZomoPlanFileInfoDTO[];
}

export interface ZomoPlanFileInfoDTO {
    id: string;
    year: string;
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

export interface OrderCollectionDTO {
    orders: OrderEntryDTO[];
}

export interface OrderEntryDTO {
    id: string;
    createdAt: Date;
    sampleCount: number;
    version: string;
    fileName: string;
    nrls: string[];
    pathogens: string[];
    sampleIds: string[];
    sampleIdsAVV: string[];
    results: string;
}

export type ResultDataDTO = Record<string, string>;

export interface ResultDTO {
    id: string;
    position: number;
    resultData: ResultDataDTO;
}

export interface SampleWithResultsDTO {
    id: string;
    position: number;
    sampleData: SampleDataDTO;
    sampleMeta: SampleMetaDTO;
    results: ResultDTO[];
}

export interface SamplesWithResultsCollectionDTO {
    orderId: string;
    samples: SampleWithResultsDTO[];
}
